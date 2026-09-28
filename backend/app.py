import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from dotenv import load_dotenv
from prediction import calculate_prediction
from datetime import datetime
from waitress import serve

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = Flask(__name__)
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
CORS(app)
jwt_secret_key = os.environ.get("JWT_SECRET_KEY")
if not jwt_secret_key:
    raise RuntimeError("Set JWT_SECRET_KEY in the environment or root .env file.")
app.config["JWT_SECRET_KEY"] = jwt_secret_key
jwt = JWTManager(app)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path == "api" or path.startswith("api/"):
        return jsonify({"message": "Not found"}), 404
    file_path = os.path.join(FRONTEND_DIST, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")

DB_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "localhost"),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", ""),
    "database": os.environ.get("MYSQL_DATABASE", "plm_predictive_service"),
    "auth_plugin": "mysql_native_password",
    "connect_timeout": 5,
}

DEMO_DASHBOARD = {
    "total_products": 5,
    "healthy_products": 3,
    "products_requiring_service": 2,
    "critical_products": 1,
    "average_health_score": 86.4,
    "average_remaining_useful_life": 312,
    "recent_products": [
        {"product_id": "GBX001", "health_score": 96, "remaining_useful_life": 430, "service_required": "No"},
        {"product_id": "GBX002", "health_score": 88, "remaining_useful_life": 320, "service_required": "No"},
        {"product_id": "GBX003", "health_score": 72, "remaining_useful_life": 220, "service_required": "Yes"},
        {"product_id": "GBX004", "health_score": 58, "remaining_useful_life": 90, "service_required": "Yes"},
        {"product_id": "GBX005", "health_score": 91, "remaining_useful_life": 360, "service_required": "No"},
    ],
}

DEMO_ALERTS = [
    {"id": 1, "alert_type": "High Vibration", "message": "Gearbox GBX004 vibration exceeded threshold."},
    {"id": 2, "alert_type": "Overdue Service", "message": "GBX003 is due for preventive maintenance."},
    {"id": 3, "alert_type": "Temperature Spike", "message": "GBX002 temperature rose above safe limits."},
]

DEMO_PRODUCTS = [
    {"product_id": "GBX001", "health_score": 96, "remaining_useful_life": 430, "service_required": "No"},
    {"product_id": "GBX002", "health_score": 88, "remaining_useful_life": 320, "service_required": "No"},
    {"product_id": "GBX003", "health_score": 72, "remaining_useful_life": 220, "service_required": "Yes"},
    {"product_id": "GBX004", "health_score": 58, "remaining_useful_life": 90, "service_required": "Yes"},
    {"product_id": "GBX005", "health_score": 91, "remaining_useful_life": 360, "service_required": "No"},
]


def get_db_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error:
        return None


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    if not all([username, email, password]):
        return jsonify({"message": "Missing fields"}), 400

    password_hash = generate_password_hash(password)
    with get_db_connection() as conn, conn.cursor() as cursor:
        cursor.execute("SELECT id FROM Users WHERE email = %s OR username = %s", (email, username))
        if cursor.fetchone():
            return jsonify({"message": "User already exists"}), 409
        cursor.execute("INSERT INTO Users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
        conn.commit()
    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        return jsonify({"message": "Missing credentials"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Invalid login"}), 401

    with conn, conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"message": "Invalid login"}), 401

    access_token = create_access_token(identity=str(user["id"]))
    return jsonify({"access_token": access_token, "user": {"id": user["id"], "username": user["username"], "email": user["email"]}})


@app.route("/api/products", methods=["GET"])
@jwt_required()
def get_products():
    conn = get_db_connection()
    if not conn:
        return jsonify(DEMO_PRODUCTS)
    try:
        with conn, conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT p.*, u.operating_hours, u.product_age_months, u.health_score, u.remaining_useful_life, u.service_required FROM Products p JOIN Usage_Data u ON p.product_id = u.product_id")
            products = cursor.fetchall()
        return jsonify(products)
    except mysql.connector.Error:
        return jsonify(DEMO_PRODUCTS)


@app.route("/api/products/<product_id>", methods=["GET"])
@jwt_required()
def get_product(product_id):
    with get_db_connection() as conn, conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM Products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return jsonify({"message": "Product not found"}), 404
        cursor.execute("SELECT * FROM Usage_Data WHERE product_id = %s", (product_id,))
        usage = cursor.fetchone()
        cursor.execute("SELECT * FROM Maintenance_History WHERE product_id = %s ORDER BY maintenance_date DESC LIMIT 10", (product_id,))
        maintenance = cursor.fetchall()
    return jsonify({"product": product, "usage": usage, "maintenance": maintenance})


@app.route("/api/products", methods=["POST"])
@jwt_required()
def create_product():
    data = request.form
    product_id = data.get("product_id")
    product_name = data.get("product_name")
    product_category = data.get("product_category")
    manufacturer = data.get("manufacturer")
    manufacture_date = data.get("manufacture_date")
    expected_life_hours = data.get("expected_life_hours")
    service_interval_hours = data.get("service_interval_hours")
    cad_file = request.files.get("cad_file")
    bom_file = request.files.get("bom_file")

    if not all([product_id, product_name, product_category, manufacturer, manufacture_date, expected_life_hours, service_interval_hours]):
        return jsonify({"message": "Missing required product fields"}), 400

    cad_path = f"/cad/{product_id}_{cad_file.filename}" if cad_file else None
    bom_path = f"/bom/{product_id}_{bom_file.filename}" if bom_file else None

    with get_db_connection() as conn, conn.cursor() as cursor:
        cursor.execute("INSERT INTO Products (product_id, product_name, product_category, manufacturer, manufacture_date, expected_life_hours, service_interval_hours, cad_file, bom_file) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)", (product_id, product_name, product_category, manufacturer, manufacture_date, expected_life_hours, service_interval_hours, cad_path, bom_path))
        conn.commit()
    return jsonify({"message": "Product registered successfully"}), 201


@app.route("/api/usage", methods=["POST"])
@jwt_required()
def create_usage():
    data = request.json
    required = ["product_id", "product_age_months", "operating_hours", "operating_cycles", "average_load", "average_temperature", "lubrication_interval", "last_service_hours", "number_of_services", "oil_condition", "bearing_condition", "vibration_level", "health_score", "remaining_useful_life", "service_required", "next_service_days"]
    if not all(field in data for field in required):
        return jsonify({"message": "Missing usage fields"}), 400

    with get_db_connection() as conn, conn.cursor() as cursor:
        cursor.execute("INSERT INTO Usage_Data (product_id, product_age_months, operating_hours, operating_cycles, average_load, average_temperature, lubrication_interval, last_service_hours, number_of_services, oil_condition, bearing_condition, vibration_level, health_score, remaining_useful_life, service_required, next_service_days) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (data["product_id"], data["product_age_months"], data["operating_hours"], data["operating_cycles"], data["average_load"], data["average_temperature"], data["lubrication_interval"], data["last_service_hours"], data["number_of_services"], data["oil_condition"], data["bearing_condition"], data["vibration_level"], data["health_score"], data["remaining_useful_life"], data["service_required"], data["next_service_days"]))
        conn.commit()
    return jsonify({"message": "Usage record saved"}), 201


@app.route("/api/predict/<product_id>", methods=["POST"])
@jwt_required()
def predict(product_id):
    with get_db_connection() as conn, conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM Products WHERE product_id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return jsonify({"message": "Product not found"}), 404
        cursor.execute("SELECT * FROM Usage_Data WHERE product_id = %s ORDER BY updated_at DESC LIMIT 1", (product_id,))
        usage = cursor.fetchone()
        cursor.execute("SELECT * FROM Maintenance_History WHERE product_id = %s ORDER BY maintenance_date DESC LIMIT 5", (product_id,))
        maintenance = cursor.fetchall()

    if not usage:
        return jsonify({"message": "Usage history missing"}), 404

    prediction = calculate_prediction(product, usage, maintenance)

    with get_db_connection() as conn, conn.cursor() as cursor:
        cursor.execute("INSERT INTO Predictions (product_id, health_score, remaining_useful_life_hours, remaining_useful_life_days, next_service_date, maintenance_priority, priority_color, ai_recommendation, hours_since_last_service, average_daily_usage, maintenance_frequency_per_year) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (prediction["product_id"], prediction["health_score"], prediction["remaining_useful_life_hours"], prediction["remaining_useful_life_days"], prediction["next_service_date"], prediction["maintenance_priority"], prediction["priority_color"], prediction["ai_recommendation"], prediction["hours_since_last_service"], prediction["average_daily_usage"], prediction["maintenance_frequency_per_year"]))
        conn.commit()

    return jsonify(prediction)


@app.route("/api/alerts", methods=["GET"])
@jwt_required()
def alerts():
    conn = get_db_connection()
    if not conn:
        return jsonify(DEMO_ALERTS)
    try:
        with conn, conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM Alerts ORDER BY created_at DESC LIMIT 10")
            alerts = cursor.fetchall()
        return jsonify(alerts)
    except mysql.connector.Error:
        return jsonify(DEMO_ALERTS)


@app.route("/api/iot/status", methods=["GET"])
@jwt_required()
def iot_status():
    return jsonify({
        "status": "Waiting for Live Sensor Data",
        "sensors": [
            {"name": "Temperature Sensor", "value": None, "unit": "°C"},
            {"name": "Vibration Sensor", "value": None, "unit": "mm/s"},
            {"name": "RPM Sensor", "value": None, "unit": "RPM"},
            {"name": "Oil Quality Sensor", "value": None, "unit": "Index"},
        ],
        "message": "IoT module placeholder ready for future live integration.",
    })


@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard_data():
    conn = get_db_connection()
    if not conn:
        return jsonify(DEMO_DASHBOARD)
    try:
        with conn, conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT COUNT(*) AS total_products FROM Products")
            total_products = cursor.fetchone()["total_products"]
            cursor.execute("SELECT COUNT(*) AS healthy_products FROM Usage_Data WHERE health_score >= 90")
            healthy_products = cursor.fetchone()["healthy_products"]
            cursor.execute("SELECT COUNT(*) AS needs_service FROM Usage_Data WHERE service_required = 'Yes'")
            needs_service = cursor.fetchone()["needs_service"]
            cursor.execute("SELECT COUNT(*) AS critical_products FROM Usage_Data WHERE health_score < 60")
            critical_products = cursor.fetchone()["critical_products"]
            cursor.execute("SELECT AVG(health_score) AS avg_health_score, AVG(remaining_useful_life) AS avg_remaining_useful_life FROM Usage_Data")
            averages = cursor.fetchone()
            cursor.execute("SELECT product_id, health_score, remaining_useful_life, service_required FROM Usage_Data ORDER BY updated_at DESC LIMIT 8")
            recent_products = cursor.fetchall()
        return jsonify({
            "total_products": total_products,
            "healthy_products": healthy_products,
            "products_requiring_service": needs_service,
            "critical_products": critical_products,
            "average_health_score": float(averages["avg_health_score"] or 0),
            "average_remaining_useful_life": float(averages["avg_remaining_useful_life"] or 0),
            "recent_products": recent_products,
        })
    except mysql.connector.Error:
        return jsonify(DEMO_DASHBOARD)


if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
