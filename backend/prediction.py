from datetime import datetime, timedelta

LOADING_FACTOR = 1.0

OIL_CONDITION_SCORES = {
    "Excellent": 10,
    "Good": 8,
    "Normal": 6,
    "Average": 4,
    "Poor": 2,
    "Worn": 1,
}

BEARING_CONDITION_SCORES = {
    "Excellent": 10,
    "Good": 8,
    "Normal": 6,
    "Average": 4,
    "Poor": 2,
    "Worn": 1,
}

SERVICE_PRIORITY = [
    (90, 100, "Healthy", "Green"),
    (75, 89, "Monitor", "Yellow"),
    (60, 74, "Service Soon", "Orange"),
    (0, 59, "Immediate Service", "Red"),
]

RECOMMENDATIONS = [
    "Continue Operation",
    "Replace Lubricant",
    "Inspect Bearings",
    "Reduce Load",
    "Schedule Maintenance",
    "Immediate Service Required",
]


def calculate_health_score(metrics):
    hours_score = max(0, min(30, 30 - (metrics["operating_hours"] / metrics["expected_life_hours"]) * 30))
    age_score = max(0, min(20, 20 - (metrics["product_age_months"] / ((metrics["expected_life_hours"] / 24) / 30)) * 20))
    load_score = max(0, min(20, 20 - (metrics["average_load"] / 100) * 20))
    service_score = max(0, min(20, 20 - (metrics["number_of_services"] / max(1, metrics["expected_life_hours"] / metrics["service_interval"])) * 20))
    lubrication_score = min(10, OIL_CONDITION_SCORES.get(metrics.get("oil_condition", "Normal"), 6))

    total = hours_score + age_score + load_score + service_score + lubrication_score
    return round((total / 100) * 100, 2)


def classify_priority(score):
    for floor, ceiling, label, color in SERVICE_PRIORITY:
        if floor <= score <= ceiling:
            return label, color
    return "Immediate Service", "Red"


def choose_recommendation(score, service_required):
    if score >= 90:
        return "Continue Operation"
    if score >= 75:
        return "Inspect Bearings"
    if score >= 60:
        return "Replace Lubricant"
    if service_required:
        return "Immediate Service Required"
    return "Schedule Maintenance"


def calculate_prediction(product, usage_history, maintenance_history):
    today = datetime.utcnow().date()
    expected_life_hours = product["expected_life_hours"]
    operating_hours = usage_history["operating_hours"]
    product_age_months = usage_history["product_age_months"]
    average_load = usage_history["average_load"]
    average_temperature = usage_history["average_temperature"]
    lubrication_interval = usage_history["lubrication_interval"]
    last_service_hours = usage_history["last_service_hours"]
    number_of_services = usage_history["number_of_services"]
    oil_condition = usage_history["oil_condition"]
    bearing_condition = usage_history["bearing_condition"]
    service_required = usage_history["service_required"]
    next_service_days = usage_history["next_service_days"]

    average_daily_usage = max(1, operating_hours / max(1, product_age_months * 30))
    remaining_hours = max(0, expected_life_hours - operating_hours)
    remaining_days = round(remaining_hours / average_daily_usage, 1)
    next_service_date = today + timedelta(days=int(next_service_days))
    hours_since_last_service = operating_hours - last_service_hours
    maintenance_frequency = max(1, number_of_services / max(1, product_age_months / 12))

    metrics = {
        "operating_hours": operating_hours,
        "expected_life_hours": expected_life_hours,
        "product_age_months": product_age_months,
        "average_load": average_load,
        "number_of_services": number_of_services,
        "service_interval": product["service_interval_hours"],
        "oil_condition": oil_condition,
    }

    health_score = calculate_health_score(metrics)
    priority, color = classify_priority(health_score)
    recommendation = choose_recommendation(health_score, service_required == "Yes")

    prediction = {
        "product_id": product["product_id"],
        "health_score": health_score,
        "remaining_useful_life_hours": remaining_hours,
        "remaining_useful_life_days": remaining_days,
        "next_service_date": next_service_date.isoformat(),
        "maintenance_priority": priority,
        "priority_color": color,
        "ai_recommendation": recommendation,
        "hours_since_last_service": max(0, hours_since_last_service),
        "average_daily_usage": round(average_daily_usage, 2),
        "maintenance_frequency_per_year": round(maintenance_frequency, 2),
        "computed_at": datetime.utcnow().isoformat() + "Z",
    }
    return prediction
