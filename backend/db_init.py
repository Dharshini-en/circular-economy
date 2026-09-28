import csv
import os
import random
from datetime import date, timedelta
import mysql.connector
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MYSQL_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "localhost"),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", ""),
    "database": os.environ.get("MYSQL_DATABASE", "plm_predictive_service"),
}

BASE_PRODUCTS = [
    {"product_id": "GBX001", "product_name": "Industrial Gearbox", "product_category": "Gearbox", "manufacturer": "ABC Industries", "manufacture_date": date(2025, 1, 10), "expected_life_hours": 3000, "service_interval_hours": 500, "product_age_months": 18, "operating_hours": 2450, "operating_cycles": 18000, "average_load": 82, "average_temperature": 58, "lubrication_interval": 90, "last_service_hours": 2240, "number_of_services": 5, "oil_condition": "Good", "bearing_condition": "Normal", "vibration_level": 2.8, "health_score": 85, "remaining_useful_life": 550, "service_required": "Yes", "next_service_days": 100},
    {"product_id": "GBX002", "product_name": "Industrial Gearbox", "product_category": "Gearbox", "manufacturer": "ABC Industries", "manufacture_date": date(2025, 3, 18), "expected_life_hours": 3000, "service_interval_hours": 450, "product_age_months": 12, "operating_hours": 1400, "operating_cycles": 12000, "average_load": 55, "average_temperature": 42, "lubrication_interval": 120, "last_service_hours": 1260, "number_of_services": 3, "oil_condition": "Excellent", "bearing_condition": "Good", "vibration_level": 1.3, "health_score": 96, "remaining_useful_life": 1600, "service_required": "No", "next_service_days": 320},
    {"product_id": "GBX003", "product_name": "Industrial Gearbox", "product_category": "Gearbox", "manufacturer": "ABC Industries", "manufacture_date": date(2024, 1, 15), "expected_life_hours": 3000, "service_interval_hours": 420, "product_age_months": 30, "operating_hours": 3100, "operating_cycles": 24000, "average_load": 91, "average_temperature": 68, "lubrication_interval": 120, "last_service_hours": 2900, "number_of_services": 8, "oil_condition": "Poor", "bearing_condition": "Worn", "vibration_level": 4.5, "health_score": 55, "remaining_useful_life": 120, "service_required": "Yes", "next_service_days": 10},
    {"product_id": "GBX004", "product_name": "Industrial Gearbox", "product_category": "Gearbox", "manufacturer": "ABC Industries", "manufacture_date": date(2025, 8, 1), "expected_life_hours": 3000, "service_interval_hours": 520, "product_age_months": 8, "operating_hours": 950, "operating_cycles": 8500, "average_load": 45, "average_temperature": 38, "lubrication_interval": 30, "last_service_hours": 850, "number_of_services": 2, "oil_condition": "Excellent", "bearing_condition": "Excellent", "vibration_level": 0.9, "health_score": 98, "remaining_useful_life": 2050, "service_required": "No", "next_service_days": 400},
    {"product_id": "GBX005", "product_name": "Industrial Gearbox", "product_category": "Gearbox", "manufacturer": "ABC Industries", "manufacture_date": date(2024, 9, 5), "expected_life_hours": 3000, "service_interval_hours": 480, "product_age_months": 22, "operating_hours": 2700, "operating_cycles": 20000, "average_load": 80, "average_temperature": 61, "lubrication_interval": 85, "last_service_hours": 2500, "number_of_services": 6, "oil_condition": "Average", "bearing_condition": "Normal", "vibration_level": 3.4, "health_score": 72, "remaining_useful_life": 300, "service_required": "Yes", "next_service_days": 45},
]

OIL_OPTIONS = ["Excellent", "Good", "Normal", "Average", "Poor"]
BEARING_OPTIONS = ["Excellent", "Good", "Normal", "Average", "Poor", "Worn"]
SERVICE_REQUIRED_OPTIONS = ["Yes", "No"]


def connect_db():
    return mysql.connector.connect(**MYSQL_CONFIG)


def create_schema():
    script_path = os.path.join(os.path.dirname(__file__), "sql", "schema.sql")
    with connect_db() as conn, conn.cursor() as cursor:
        with open(script_path, "r", encoding="utf-8") as f:
            script = f.read()
        for statement in script.split(";"):
            text = statement.strip()
            if text:
                cursor.execute(text)
        conn.commit()


def generate_random_product(index):
    manufacture_date = date(2023, 1, 1) + timedelta(days=random.randint(180, 1400))
    age_months = max(1, (date.today().year - manufacture_date.year) * 12 + date.today().month - manufacture_date.month)
    expected_life = 3000
    operating_hours = min(expected_life, random.randint(500, 3200))
    average_load = random.randint(40, 95)
    average_temperature = random.randint(30, 80)
    last_service_hours = max(0, operating_hours - random.randint(150, 520))
    number_of_services = max(1, operating_hours // 500)
    oil_condition = random.choice(OIL_OPTIONS)
    bearing_condition = random.choice(BEARING_OPTIONS)
    vibration_level = round(random.uniform(0.9, 5.5), 2)
    remaining_useful_life = max(0, expected_life - operating_hours)
    next_service_days = random.randint(10, 420)
    service_required = "Yes" if remaining_useful_life < 400 or oil_condition in ["Poor", "Average"] else "No"

    return {
        "product_id": f"GBX{100 + index}",
        "product_name": "Industrial Gearbox",
        "product_category": "Gearbox",
        "manufacturer": "ABC Industries",
        "manufacture_date": manufacture_date,
        "expected_life_hours": expected_life,
        "service_interval_hours": random.choice([420, 450, 480, 500, 520]),
        "product_age_months": age_months,
        "operating_hours": operating_hours,
        "operating_cycles": operating_hours * random.randint(6, 9),
        "average_load": average_load,
        "average_temperature": average_temperature,
        "lubrication_interval": random.choice([60, 75, 90, 120]),
        "last_service_hours": last_service_hours,
        "number_of_services": number_of_services,
        "oil_condition": oil_condition,
        "bearing_condition": bearing_condition,
        "vibration_level": vibration_level,
        "health_score": round(max(35, 100 - (operating_hours / expected_life) * 60 - (average_load / 100) * 15 - (0 if oil_condition == "Excellent" else 10)), 2),
        "remaining_useful_life": remaining_useful_life,
        "service_required": service_required,
        "next_service_days": next_service_days,
    }


def load_data():
    with connect_db() as conn, conn.cursor() as cursor:
        products = BASE_PRODUCTS[:] + [generate_random_product(i) for i in range(6, 1001)]

        product_sql = ("INSERT INTO Products (product_id, product_name, product_category, manufacturer, manufacture_date, expected_life_hours, service_interval_hours, cad_file, bom_file) "
                       "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)")
        usage_sql = ("INSERT INTO Usage_Data (product_id, product_age_months, operating_hours, operating_cycles, average_load, average_temperature, lubrication_interval, last_service_hours, number_of_services, oil_condition, bearing_condition, vibration_level, health_score, remaining_useful_life, service_required, next_service_days) "
                     "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        maintenance_sql = ("INSERT INTO Maintenance_History (product_id, maintenance_date, service_type, notes, status) VALUES (%s, %s, %s, %s, %s)")

        for record in products:
            cursor.execute(product_sql, (
                record["product_id"], record["product_name"], record["product_category"], record["manufacturer"], record["manufacture_date"], record["expected_life_hours"], record["service_interval_hours"], f"/cad/{record['product_id']}.stp", f"/bom/{record['product_id']}.xls"
            ))
            cursor.execute(usage_sql, (
                record["product_id"], record["product_age_months"], record["operating_hours"], record["operating_cycles"], record["average_load"], record["average_temperature"], record["lubrication_interval"], record["last_service_hours"], record["number_of_services"], record["oil_condition"], record["bearing_condition"], record["vibration_level"], record["health_score"], record["remaining_useful_life"], record["service_required"], record["next_service_days"]
            ))
            maintenance_date = date.today() - timedelta(days=random.randint(10, 240))
            cursor.execute(maintenance_sql, (
                record["product_id"], maintenance_date, "Routine Inspection", "Scheduled maintenance activity.", "Completed"
            ))
        conn.commit()


if __name__ == "__main__":
    create_schema()
    print("Schema created.")
    load_data()
    print("Sample product dataset loaded.")
