from __future__ import annotations

import json
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker


SEED = 42
N_LEADS = 2500

random.seed(SEED)
np.random.seed(SEED)
fake = Faker("en_CA")
Faker.seed(SEED)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

START_DATE = datetime(2026, 1, 1)
END_DATE = datetime(2026, 6, 30, 23, 59, 59)

SETTERS = ["Alex Morgan", "Jordan Lee", "Taylor Brooks"]
CLOSERS = ["Morgan Reed", "Casey Bennett", "Riley Carter"]

PRODUCTS = {
    "Mentorship Premium": {"price": 10000, "weight": 0.28},
    "Mentorship Standard": {"price": 5000, "weight": 0.35},
    "Group Program": {"price": 2500, "weight": 0.18},
    "Workshop": {"price": 750, "weight": 0.12},
    "Digital Course": {"price": 297, "weight": 0.07},
}

CHANNELS = {
    "Meta Ads": {
        "weight": 0.34,
        "campaigns": ["Evergreen Wealth", "Investor Calculator", "Mentorship VSL"],
        "booking_modifier": -0.02,
        "close_modifier": -0.01,
    },
    "Google Ads": {
        "weight": 0.12,
        "campaigns": ["High Intent Search", "Real Estate Mentorship"],
        "booking_modifier": 0.03,
        "close_modifier": 0.02,
    },
    "Organic": {
        "weight": 0.16,
        "campaigns": ["Organic Content"],
        "booking_modifier": 0.01,
        "close_modifier": 0.01,
    },
    "Referral": {
        "weight": 0.09,
        "campaigns": ["Partner Referral", "Client Referral"],
        "booking_modifier": 0.10,
        "close_modifier": 0.08,
    },
    "Webinar": {
        "weight": 0.20,
        "campaigns": ["5-Day Investor Challenge", "VIP Webinar"],
        "booking_modifier": 0.07,
        "close_modifier": 0.05,
    },
    "Email Campaign": {
        "weight": 0.05,
        "campaigns": ["Database Reactivation"],
        "booking_modifier": -0.04,
        "close_modifier": -0.02,
    },
    "Direct": {
        "weight": 0.04,
        "campaigns": ["Direct Traffic"],
        "booking_modifier": 0.02,
        "close_modifier": 0.01,
    },
}


def uid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def random_datetime(start: datetime, end: datetime) -> datetime:
    seconds = int((end - start).total_seconds())
    return start + timedelta(seconds=random.randint(0, max(seconds, 1)))


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def create_representatives() -> pd.DataFrame:
    rows = []

    for name in SETTERS:
        rows.append({
            "representative_id": uid("rep"),
            "representative_name": name,
            "role": "Setter",
            "active": True,
            "start_date": random_datetime(
                datetime(2024, 1, 1), datetime(2025, 10, 1)
            ).date().isoformat(),
            "monthly_target": random.choice([120, 140, 160]),
            "commission_rate": random.choice([0.0, 0.01, 0.015]),
        })

    for name in CLOSERS:
        rows.append({
            "representative_id": uid("rep"),
            "representative_name": name,
            "role": "Closer",
            "active": True,
            "start_date": random_datetime(
                datetime(2023, 1, 1), datetime(2025, 8, 1)
            ).date().isoformat(),
            "monthly_target": random.choice([45000, 60000, 75000]),
            "commission_rate": random.choice([0.05, 0.06, 0.08]),
        })

    return pd.DataFrame(rows)


def create_leads() -> pd.DataFrame:
    channel_names = list(CHANNELS.keys())
    channel_weights = [CHANNELS[name]["weight"] for name in channel_names]
    rows = []

    for _ in range(N_LEADS):
        source = random.choices(channel_names, weights=channel_weights, k=1)[0]
        campaign = random.choice(CHANNELS[source]["campaigns"])
        created_at = random_datetime(START_DATE, END_DATE)

        response_minutes = int(np.random.lognormal(mean=3.5, sigma=0.8))
        contacted_at = created_at + timedelta(minutes=random.randint(5, 180))
        first_response_at = created_at + timedelta(minutes=response_minutes)

        lead_score = int(np.clip(
            np.random.normal(58, 16)
            + (10 if source in {"Referral", "Webinar"} else 0)
            - min(response_minutes / 60, 24) * 0.8,
            1,
            100,
        ))

        funnel_type = {
            "Webinar": "Webinar",
            "Referral": "Referral",
            "Organic": "Organic",
        }.get(source, "Evergreen")

        rows.append({
            "lead_id": uid("lead"),
            "created_at": created_at.isoformat(),
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "email": fake.unique.email(),
            "phone": fake.phone_number(),
            "country": random.choices(
                ["Canada", "United States", "Mexico", "France"],
                weights=[0.60, 0.20, 0.15, 0.05],
                k=1,
            )[0],
            "source": source,
            "campaign": campaign,
            "funnel_type": funnel_type,
            "landing_page": f"/{campaign.lower().replace(' ', '-')}",
            "utm_source": source.lower().replace(" ", "_"),
            "utm_medium": (
                "paid_social"
                if source == "Meta Ads"
                else "cpc"
                if source == "Google Ads"
                else "organic"
            ),
            "utm_campaign": campaign.lower().replace(" ", "_"),
            "assigned_setter": random.choice(SETTERS),
            "assigned_closer": random.choice(CLOSERS),
            "current_stage": "New Lead",
            "lead_score": lead_score,
            "contacted_at": contacted_at.isoformat(),
            "first_response_at": first_response_at.isoformat(),
            "booking_id": None,
            "sale_id": None,
        })

    return pd.DataFrame(rows)


def create_bookings(leads: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for idx, lead in leads.iterrows():
        created_at = pd.Timestamp(lead["created_at"]).to_pydatetime()
        first_response_at = pd.Timestamp(lead["first_response_at"]).to_pydatetime()
        response_hours = max((first_response_at - created_at).total_seconds() / 3600, 0)

        probability = (
            0.22
            + (lead["lead_score"] - 50) * 0.004
            + CHANNELS[lead["source"]]["booking_modifier"]
            - min(response_hours, 24) * 0.006
        )
        probability = clamp(probability, 0.04, 0.70)

        if random.random() > probability:
            continue

        booking_id = uid("book")
        booked_at = created_at + timedelta(minutes=random.randint(15, 60 * 72))
        appointment_date = booked_at + timedelta(
            days=random.randint(1, 12),
            hours=random.randint(0, 8),
        )

        show_probability = (
            0.60
            + (lead["lead_score"] - 50) * 0.003
            + (0.08 if lead["source"] in {"Referral", "Webinar"} else 0)
        )
        show_probability = clamp(show_probability, 0.35, 0.88)

        outcome_roll = random.random()
        if outcome_roll < show_probability:
            status = "Showed"
        elif outcome_roll < show_probability + 0.16:
            status = "No Show"
        elif outcome_roll < show_probability + 0.25:
            status = "Cancelled"
        else:
            status = "Rescheduled"

        reschedule_count = 0
        cancellation_reason = None
        no_show_reason = None

        if status == "Rescheduled":
            reschedule_count = random.choice([1, 1, 1, 2])
        elif status == "Cancelled":
            cancellation_reason = random.choice([
                "Scheduling conflict",
                "Not ready",
                "Financial concern",
                "Changed priorities",
            ])
        elif status == "No Show":
            no_show_reason = random.choice([
                "No response",
                "Forgot appointment",
                "Work conflict",
                "Unknown",
            ])

        rows.append({
            "booking_id": booking_id,
            "lead_id": lead["lead_id"],
            "booked_at": booked_at.isoformat(),
            "appointment_date": appointment_date.isoformat(),
            "calendar_name": random.choice([
                "Investment Consultation",
                "Strategic Consultation",
                "Follow Up Call",
            ]),
            "appointment_type": (
                "Initial Consultation"
                if random.random() < 0.85
                else "Follow Up"
            ),
            "appointment_status": status,
            "setter_name": lead["assigned_setter"],
            "closer_name": lead["assigned_closer"],
            "booking_source": lead["source"],
            "reschedule_count": reschedule_count,
            "cancellation_reason": cancellation_reason,
            "no_show_reason": no_show_reason,
        })

        leads.at[idx, "booking_id"] = booking_id
        leads.at[idx, "current_stage"] = (
            "Consultation Showed"
            if status == "Showed"
            else "Call Booked"
            if status in {"Scheduled", "Confirmed", "Rescheduled"}
            else status
        )

    return pd.DataFrame(rows)


def create_opportunities_and_sales(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    opportunity_rows = []
    sales_rows = []

    booking_lookup = {
        row["lead_id"]: row
        for _, row in bookings.iterrows()
    }

    product_names = list(PRODUCTS.keys())
    product_weights = [PRODUCTS[name]["weight"] for name in product_names]

    for idx, lead in leads.iterrows():
        booking = booking_lookup.get(lead["lead_id"])
        opportunity_id = uid("opp")
        created_at = pd.Timestamp(lead["created_at"]).to_pydatetime()
        last_stage_change = created_at + timedelta(days=random.randint(0, 30))

        status = "Open"
        stage_name = "New Lead"
        monetary_value = 0.0
        lost_reason = None

        if booking is None:
            roll = random.random()
            if roll < 0.16:
                status = "Lost"
                stage_name = "Closed Lost"
                lost_reason = random.choice([
                    "Unable to contact",
                    "Not interested",
                    "No budget",
                    "Timing",
                ])
            elif roll < 0.28:
                stage_name = "Follow Up"
            elif roll < 0.60:
                stage_name = "Contact Attempted"
            else:
                stage_name = "Contacted"
        elif booking["appointment_status"] != "Showed":
            stage_name = (
                "Call Booked"
                if booking["appointment_status"] == "Rescheduled"
                else booking["appointment_status"]
            )
            if booking["appointment_status"] in {"Cancelled", "No Show"}:
                status = "Lost" if random.random() < 0.45 else "Open"
                if status == "Lost":
                    stage_name = "Closed Lost"
                    lost_reason = booking["appointment_status"]
        else:
            stage_name = "Consultation Showed"
            offer_probability = clamp(
                0.58 + (lead["lead_score"] - 50) * 0.004,
                0.25,
                0.88,
            )

            if random.random() < offer_probability:
                stage_name = "Offer Made"
                product_name = random.choices(
                    product_names,
                    weights=product_weights,
                    k=1,
                )[0]
                list_price = PRODUCTS[product_name]["price"]

                close_probability = clamp(
                    0.20
                    + (lead["lead_score"] - 50) * 0.003
                    + CHANNELS[lead["source"]]["close_modifier"]
                    + (0.04 if lead["assigned_closer"] == "Morgan Reed" else 0)
                    - (0.02 if lead["assigned_closer"] == "Riley Carter" else 0),
                    0.08,
                    0.55,
                )

                offer_date = pd.Timestamp(
                    booking["appointment_date"]
                ).to_pydatetime()
                discount_amount = random.choices(
                    [0, 250, 500, 1000],
                    weights=[0.58, 0.17, 0.18, 0.07],
                    k=1,
                )[0]
                contract_value = max(list_price - discount_amount, 197)

                if random.random() < close_probability:
                    status = "Won"
                    stage_name = "Closed Won"
                    monetary_value = contract_value
                    close_date = offer_date + timedelta(days=random.randint(0, 14))
                    payment_plan = random.choices(
                        ["Paid in Full", "2 Payments", "4 Payments", "12 Payments"],
                        weights=[0.38, 0.24, 0.24, 0.14],
                        k=1,
                    )[0]

                    installments_map = {
                        "Paid in Full": 1,
                        "2 Payments": 2,
                        "4 Payments": 4,
                        "12 Payments": 12,
                    }
                    expected_installments = installments_map[payment_plan]
                    upfront_amount = (
                        contract_value
                        if payment_plan == "Paid in Full"
                        else round(contract_value / expected_installments, 2)
                    )
                    recurring_amount = (
                        0.0
                        if payment_plan == "Paid in Full"
                        else round(
                            (contract_value - upfront_amount)
                            / max(expected_installments - 1, 1),
                            2,
                        )
                    )

                    sale_id = uid("sale")
                    sales_rows.append({
                        "sale_id": sale_id,
                        "lead_id": lead["lead_id"],
                        "booking_id": booking["booking_id"],
                        "opportunity_id": opportunity_id,
                        "closer_name": lead["assigned_closer"],
                        "offer_date": offer_date.isoformat(),
                        "close_date": close_date.isoformat(),
                        "offer_status": "Won",
                        "product_name": product_name,
                        "contract_value": contract_value,
                        "payment_plan": payment_plan,
                        "upfront_amount": upfront_amount,
                        "recurring_amount": recurring_amount,
                        "expected_installments": expected_installments,
                        "discount_amount": discount_amount,
                    })
                    leads.at[idx, "sale_id"] = sale_id
                    leads.at[idx, "current_stage"] = "Closed Won"
                else:
                    status = "Lost"
                    stage_name = "Closed Lost"
                    monetary_value = contract_value
                    lost_reason = random.choice([
                        "Price",
                        "Financing unavailable",
                        "Needs more time",
                        "Partner approval",
                        "Chose competitor",
                    ])
            else:
                status = "Lost" if random.random() < 0.55 else "Open"
                stage_name = "Disqualified" if status == "Lost" else "Follow Up"
                lost_reason = (
                    random.choice([
                        "Not qualified",
                        "Insufficient capital",
                        "Wrong timing",
                        "Low intent",
                    ])
                    if status == "Lost"
                    else None
                )

        opportunity_rows.append({
            "opportunity_id": opportunity_id,
            "lead_id": lead["lead_id"],
            "created_at": created_at.isoformat(),
            "pipeline_name": (
                "Evergreen Sales"
                if lead["funnel_type"] == "Evergreen"
                else f"{lead['funnel_type']} Sales"
            ),
            "stage_name": stage_name,
            "assigned_user": lead["assigned_closer"],
            "status": status,
            "monetary_value": monetary_value,
            "last_stage_change_at": last_stage_change.isoformat(),
            "days_in_pipeline": max((END_DATE - last_stage_change).days, 0),
            "lost_reason": lost_reason,
        })

    return pd.DataFrame(opportunity_rows), pd.DataFrame(sales_rows)


def create_payments(sales: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for _, sale in sales.iterrows():
        close_date = pd.Timestamp(sale["close_date"]).to_pydatetime()
        expected_installments = int(sale["expected_installments"])
        contract_value = float(sale["contract_value"])
        payment_plan = sale["payment_plan"]

        amounts = []
        if expected_installments == 1:
            amounts = [contract_value]
        else:
            upfront = float(sale["upfront_amount"])
            recurring = float(sale["recurring_amount"])
            amounts = [upfront] + [recurring] * (expected_installments - 1)

            rounding_difference = round(contract_value - sum(amounts), 2)
            amounts[-1] = round(amounts[-1] + rounding_difference, 2)

        for installment_number, amount in enumerate(amounts, start=1):
            payment_date = close_date + timedelta(
                days=30 * (installment_number - 1)
            )

            if payment_date > END_DATE:
                break

            outcome = random.choices(
                ["Succeeded", "Failed", "Pending"],
                weights=[0.90, 0.06, 0.04],
                k=1,
            )[0]

            payment_amount = amount if outcome == "Succeeded" else 0.0

            rows.append({
                "payment_id": uid("pay"),
                "sale_id": sale["sale_id"],
                "lead_id": sale["lead_id"],
                "payment_date": payment_date.isoformat(),
                "payment_type": (
                    "Upfront"
                    if installment_number == 1
                    else "Recurring"
                ),
                "payment_status": outcome,
                "amount": round(payment_amount, 2),
                "payment_method": random.choices(
                    ["Credit Card", "Bank Transfer", "Financing", "PayPal"],
                    weights=[0.64, 0.16, 0.15, 0.05],
                    k=1,
                )[0],
                "transaction_reference": uid("txn"),
                "installment_number": installment_number,
            })

            if outcome == "Succeeded" and random.random() < 0.025:
                refund_date = payment_date + timedelta(days=random.randint(3, 25))
                if refund_date <= END_DATE:
                    rows.append({
                        "payment_id": uid("pay"),
                        "sale_id": sale["sale_id"],
                        "lead_id": sale["lead_id"],
                        "payment_date": refund_date.isoformat(),
                        "payment_type": "Refund",
                        "payment_status": "Refunded",
                        "amount": round(-payment_amount, 2),
                        "payment_method": "Original Method",
                        "transaction_reference": uid("txn"),
                        "installment_number": installment_number,
                    })

    return pd.DataFrame(rows)


def create_marketing_expenses(leads: pd.DataFrame) -> pd.DataFrame:
    rows = []
    monthly_periods = pd.period_range("2026-01", "2026-06", freq="M")

    for period in monthly_periods:
        month_start = period.start_time.to_pydatetime()
        month_end = min(
            period.end_time.to_pydatetime(),
            END_DATE,
        )

        for channel, config in CHANNELS.items():
            for campaign in config["campaigns"]:
                month_leads = leads[
                    (pd.to_datetime(leads["created_at"]).dt.to_period("M") == period)
                    & (leads["campaign"] == campaign)
                ]

                lead_count = len(month_leads)

                if channel == "Meta Ads":
                    spend = random.uniform(3500, 8500)
                    category = "Advertising"
                elif channel == "Google Ads":
                    spend = random.uniform(2200, 6000)
                    category = "Advertising"
                elif channel == "Webinar":
                    spend = random.uniform(1200, 4200)
                    category = random.choice(["Event", "Creative Production"])
                elif channel == "Referral":
                    spend = random.uniform(300, 1500)
                    category = "Contractor"
                elif channel == "Email Campaign":
                    spend = random.uniform(250, 900)
                    category = "Software"
                elif channel == "Organic":
                    spend = random.uniform(800, 2200)
                    category = "Creative Production"
                else:
                    spend = random.uniform(200, 700)
                    category = "Software"

                clicks = max(
                    int(lead_count * random.uniform(3.0, 7.5)),
                    lead_count,
                )
                impressions = max(
                    int(clicks * random.uniform(18, 42)),
                    clicks,
                )

                rows.append({
                    "expense_id": uid("exp"),
                    "expense_date": random_datetime(
                        month_start,
                        month_end,
                    ).date().isoformat(),
                    "channel": channel,
                    "campaign": campaign,
                    "expense_category": category,
                    "amount": round(spend, 2),
                    "leads_generated": lead_count,
                    "impressions": impressions,
                    "clicks": clicks,
                })

    return pd.DataFrame(rows)


def create_sales_activities(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    sales: pd.DataFrame,
) -> pd.DataFrame:
    rows = []
    booking_lookup = {
        row["lead_id"]: row
        for _, row in bookings.iterrows()
    }
    won_leads = set(sales["lead_id"]) if not sales.empty else set()

    for _, lead in leads.iterrows():
        lead_created = pd.Timestamp(lead["created_at"]).to_pydatetime()
        booking = booking_lookup.get(lead["lead_id"])
        activity_count = random.randint(1, 4) if booking is None else random.randint(3, 8)

        for sequence in range(activity_count):
            representative_role = "Setter"
            representative_name = lead["assigned_setter"]
            booking_id = None
            activity_type = random.choice(["Call", "SMS", "Email", "WhatsApp"])
            activity_result = random.choice([
                "No Answer",
                "Connected",
                "Interested",
                "Follow Up Required",
            ])

            if booking is not None and sequence >= max(activity_count - 2, 1):
                representative_role = "Closer"
                representative_name = lead["assigned_closer"]
                booking_id = booking["booking_id"]
                activity_type = random.choice(["Consultation", "Follow Up", "Call"])

                if lead["lead_id"] in won_leads:
                    activity_result = "Closed Won"
                elif booking["appointment_status"] == "Showed":
                    activity_result = random.choice([
                        "Qualified",
                        "Offer Made",
                        "Follow Up Required",
                    ])
                else:
                    activity_result = random.choice([
                        "No Answer",
                        "Follow Up Required",
                    ])

            activity_date = lead_created + timedelta(
                hours=random.randint(1, 24 * 20)
            )

            rows.append({
                "activity_id": uid("act"),
                "lead_id": lead["lead_id"],
                "booking_id": booking_id,
                "activity_date": activity_date.isoformat(),
                "representative_name": representative_name,
                "representative_role": representative_role,
                "activity_type": activity_type,
                "activity_result": activity_result,
                "notes": fake.sentence(nb_words=10),
                "duration_minutes": (
                    random.randint(15, 60)
                    if activity_type in {"Consultation", "Follow Up"}
                    else random.randint(1, 12)
                ),
            })

    return pd.DataFrame(rows)


def validate_data(
    representatives: pd.DataFrame,
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    activities: pd.DataFrame,
    opportunities: pd.DataFrame,
    sales: pd.DataFrame,
    payments: pd.DataFrame,
    expenses: pd.DataFrame,
) -> None:
    unique_checks = [
        (representatives, "representative_id"),
        (leads, "lead_id"),
        (bookings, "booking_id"),
        (activities, "activity_id"),
        (opportunities, "opportunity_id"),
        (sales, "sale_id"),
        (payments, "payment_id"),
        (expenses, "expense_id"),
    ]

    for dataframe, column in unique_checks:
        if not dataframe.empty and not dataframe[column].is_unique:
            raise ValueError(f"{column} contains duplicates")

    if len(leads) != N_LEADS:
        raise ValueError(f"Expected {N_LEADS} leads, found {len(leads)}")

    if not leads["lead_score"].between(1, 100).all():
        raise ValueError("lead_score contains values outside 1-100")

    if not bookings.empty and not bookings["lead_id"].isin(leads["lead_id"]).all():
        raise ValueError("bookings contain unknown lead_id values")

    if not opportunities["lead_id"].isin(leads["lead_id"]).all():
        raise ValueError("opportunities contain unknown lead_id values")

    if not sales.empty:
        if not sales["lead_id"].isin(leads["lead_id"]).all():
            raise ValueError("sales contain unknown lead_id values")
        if not sales["opportunity_id"].isin(opportunities["opportunity_id"]).all():
            raise ValueError("sales contain unknown opportunity_id values")

    if not payments.empty and not payments["sale_id"].isin(sales["sale_id"]).all():
        raise ValueError("payments contain unknown sale_id values")

    if not sales.empty:
        won_revenue = sales["contract_value"].sum()
        opportunity_won_revenue = opportunities.loc[
            opportunities["status"] == "Won",
            "monetary_value",
        ].sum()
        if abs(won_revenue - opportunity_won_revenue) > 0.01:
            raise ValueError("Won opportunity revenue does not match sales revenue")


def main() -> None:
    print("Generating complete synthetic revenue operations data...")

    representatives = create_representatives()
    leads = create_leads()
    bookings = create_bookings(leads)
    opportunities, sales = create_opportunities_and_sales(leads, bookings)
    payments = create_payments(sales)
    expenses = create_marketing_expenses(leads)
    activities = create_sales_activities(leads, bookings, sales)

    validate_data(
        representatives,
        leads,
        bookings,
        activities,
        opportunities,
        sales,
        payments,
        expenses,
    )

    outputs = {
        "representatives.csv": representatives,
        "leads.csv": leads,
        "bookings.csv": bookings,
        "sales_activities.csv": activities,
        "opportunities.csv": opportunities,
        "sales.csv": sales,
        "payments.csv": payments,
        "marketing_expenses.csv": expenses,
    }

    for filename, dataframe in outputs.items():
        dataframe.to_csv(
            DATA_DIR / filename,
            index=False,
            encoding="utf-8",
        )

    contracted_revenue = float(sales["contract_value"].sum()) if not sales.empty else 0.0
    cash_collected = (
        float(payments["amount"].sum())
        if not payments.empty
        else 0.0
    )
    marketing_spend = float(expenses["amount"].sum()) if not expenses.empty else 0.0
    shows = int((bookings["appointment_status"] == "Showed").sum())
    closed_sales = len(sales)

    summary = {
        "seed": SEED,
        "date_range": {
            "start": START_DATE.date().isoformat(),
            "end": END_DATE.date().isoformat(),
        },
        "row_counts": {
            filename.replace(".csv", ""): len(dataframe)
            for filename, dataframe in outputs.items()
        },
        "kpis": {
            "leads": len(leads),
            "bookings": len(bookings),
            "shows": shows,
            "closed_sales": closed_sales,
            "booking_rate": round(len(bookings) / len(leads), 4),
            "show_rate": round(shows / len(bookings), 4) if len(bookings) else 0,
            "lead_to_close_rate": round(closed_sales / len(leads), 4),
            "contracted_revenue": round(contracted_revenue, 2),
            "cash_collected": round(cash_collected, 2),
            "cash_collection_rate": round(
                cash_collected / contracted_revenue,
                4,
            ) if contracted_revenue else 0,
            "marketing_spend": round(marketing_spend, 2),
            "revenue_per_lead": round(
                contracted_revenue / len(leads),
                2,
            ),
            "customer_acquisition_cost": round(
                marketing_spend / closed_sales,
                2,
            ) if closed_sales else 0,
            "return_on_ad_spend": round(
                contracted_revenue / marketing_spend,
                2,
            ) if marketing_spend else 0,
        },
        "lead_distribution_by_source": (
            leads["source"].value_counts().sort_index().to_dict()
        ),
        "appointment_status_counts": (
            bookings["appointment_status"].value_counts().to_dict()
            if not bookings.empty
            else {}
        ),
        "opportunity_status_counts": (
            opportunities["status"].value_counts().to_dict()
        ),
        "sales_by_product": (
            sales["product_name"].value_counts().to_dict()
            if not sales.empty
            else {}
        ),
    }

    with (DATA_DIR / "generation_summary.json").open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(summary, file, indent=2)

    print("Created:")
    for filename, dataframe in outputs.items():
        print(f"- {filename}: {len(dataframe):,} rows")
    print("- generation_summary.json")

    print("\nPortfolio KPI snapshot:")
    for key, value in summary["kpis"].items():
        print(f"- {key}: {value}")

    print("\nSynthetic data generation completed successfully.")


if __name__ == "__main__":
    main()
