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

CHANNELS = {
    "Meta Ads": {
        "weight": 0.34,
        "campaigns": ["Evergreen Wealth", "Investor Calculator", "Mentorship VSL"],
        "booking_modifier": -0.02,
    },
    "Google Ads": {
        "weight": 0.12,
        "campaigns": ["High Intent Search", "Real Estate Mentorship"],
        "booking_modifier": 0.03,
    },
    "Organic": {
        "weight": 0.16,
        "campaigns": ["Organic Content"],
        "booking_modifier": 0.01,
    },
    "Referral": {
        "weight": 0.09,
        "campaigns": ["Partner Referral", "Client Referral"],
        "booking_modifier": 0.10,
    },
    "Webinar": {
        "weight": 0.20,
        "campaigns": ["5-Day Investor Challenge", "VIP Webinar"],
        "booking_modifier": 0.07,
    },
    "Email Campaign": {
        "weight": 0.05,
        "campaigns": ["Database Reactivation"],
        "booking_modifier": -0.04,
    },
    "Direct": {
        "weight": 0.04,
        "campaigns": ["Direct Traffic"],
        "booking_modifier": 0.02,
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
        rows.append(
            {
                "representative_id": uid("rep"),
                "representative_name": name,
                "role": "Setter",
                "active": True,
                "start_date": random_datetime(
                    datetime(2024, 1, 1), datetime(2025, 10, 1)
                ).date().isoformat(),
                "monthly_target": random.choice([120, 140, 160]),
                "commission_rate": random.choice([0.0, 0.01, 0.015]),
            }
        )

    for name in CLOSERS:
        rows.append(
            {
                "representative_id": uid("rep"),
                "representative_name": name,
                "role": "Closer",
                "active": True,
                "start_date": random_datetime(
                    datetime(2023, 1, 1), datetime(2025, 8, 1)
                ).date().isoformat(),
                "monthly_target": random.choice([45000, 60000, 75000]),
                "commission_rate": random.choice([0.05, 0.06, 0.08]),
            }
        )

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

        lead_score = int(
            np.clip(
                np.random.normal(58, 16)
                + (10 if source in {"Referral", "Webinar"} else 0)
                - min(response_minutes / 60, 24) * 0.8,
                1,
                100,
            )
        )

        funnel_type = {
            "Webinar": "Webinar",
            "Referral": "Referral",
            "Organic": "Organic",
        }.get(source, "Evergreen")

        rows.append(
            {
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
            }
        )

    return pd.DataFrame(rows)


def create_bookings(leads: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for idx, lead in leads.iterrows():
        created_at = pd.Timestamp(lead["created_at"]).to_pydatetime()
        first_response_at = pd.Timestamp(lead["first_response_at"]).to_pydatetime()
        response_hours = max(
            (first_response_at - created_at).total_seconds() / 3600,
            0,
        )

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
        booked_at = created_at + timedelta(
            minutes=random.randint(15, 60 * 72)
        )
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
            cancellation_reason = random.choice(
                [
                    "Scheduling conflict",
                    "Not ready",
                    "Financial concern",
                    "Changed priorities",
                ]
            )
        elif status == "No Show":
            no_show_reason = random.choice(
                [
                    "No response",
                    "Forgot appointment",
                    "Work conflict",
                    "Unknown",
                ]
            )

        rows.append(
            {
                "booking_id": booking_id,
                "lead_id": lead["lead_id"],
                "booked_at": booked_at.isoformat(),
                "appointment_date": appointment_date.isoformat(),
                "calendar_name": random.choice(
                    [
                        "Investment Consultation",
                        "Strategic Consultation",
                        "Follow Up Call",
                    ]
                ),
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
            }
        )

        leads.at[idx, "booking_id"] = booking_id
        leads.at[idx, "current_stage"] = (
            "Consultation Showed"
            if status == "Showed"
            else "Call Booked"
            if status in {"Scheduled", "Confirmed", "Rescheduled"}
            else status
        )

    return pd.DataFrame(rows)


def create_sales_activities(
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
) -> pd.DataFrame:
    rows = []
    booking_lookup = {
        row["lead_id"]: row
        for _, row in bookings.iterrows()
    }

    for _, lead in leads.iterrows():
        lead_created = pd.Timestamp(lead["created_at"]).to_pydatetime()
        booking = booking_lookup.get(lead["lead_id"])
        activity_count = random.randint(1, 4) if booking is None else random.randint(3, 8)

        for sequence in range(activity_count):
            representative_role = "Setter"
            representative_name = lead["assigned_setter"]
            booking_id = None
            activity_type = random.choice(["Call", "SMS", "Email", "WhatsApp"])
            activity_result = random.choice(
                [
                    "No Answer",
                    "Connected",
                    "Interested",
                    "Follow Up Required",
                ]
            )

            if booking is not None and sequence >= max(activity_count - 2, 1):
                representative_role = "Closer"
                representative_name = lead["assigned_closer"]
                booking_id = booking["booking_id"]
                activity_type = random.choice(["Consultation", "Follow Up", "Call"])
                activity_result = (
                    "Qualified"
                    if booking["appointment_status"] == "Showed"
                    else random.choice(["No Answer", "Follow Up Required"])
                )

            activity_date = lead_created + timedelta(
                hours=random.randint(1, 24 * 20)
            )

            rows.append(
                {
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
                }
            )

    return pd.DataFrame(rows)


def validate_data(
    representatives: pd.DataFrame,
    leads: pd.DataFrame,
    bookings: pd.DataFrame,
    activities: pd.DataFrame,
) -> None:
    if not representatives["representative_id"].is_unique:
        raise ValueError("representative_id contains duplicates")

    if not leads["lead_id"].is_unique:
        raise ValueError("lead_id contains duplicates")

    if len(leads) != N_LEADS:
        raise ValueError(f"Expected {N_LEADS} leads, found {len(leads)}")

    if not leads["lead_score"].between(1, 100).all():
        raise ValueError("lead_score contains values outside 1-100")

    if not bookings.empty:
        if not bookings["booking_id"].is_unique:
            raise ValueError("booking_id contains duplicates")
        if not bookings["lead_id"].isin(leads["lead_id"]).all():
            raise ValueError("bookings contain unknown lead_id values")

    if not activities.empty:
        if not activities["activity_id"].is_unique:
            raise ValueError("activity_id contains duplicates")
        if not activities["lead_id"].isin(leads["lead_id"]).all():
            raise ValueError("activities contain unknown lead_id values")


def main() -> None:
    print("Generating synthetic revenue operations data...")

    representatives = create_representatives()
    leads = create_leads()
    bookings = create_bookings(leads)
    activities = create_sales_activities(leads, bookings)

    validate_data(representatives, leads, bookings, activities)

    outputs = {
        "representatives.csv": representatives,
        "leads.csv": leads,
        "bookings.csv": bookings,
        "sales_activities.csv": activities,
    }

    for filename, dataframe in outputs.items():
        dataframe.to_csv(
            DATA_DIR / filename,
            index=False,
            encoding="utf-8",
        )

    status_counts = (
        bookings["appointment_status"].value_counts().to_dict()
        if not bookings.empty
        else {}
    )

    summary = {
        "seed": SEED,
        "date_range": {
            "start": START_DATE.date().isoformat(),
            "end": END_DATE.date().isoformat(),
        },
        "row_counts": {
            "representatives": len(representatives),
            "leads": len(leads),
            "bookings": len(bookings),
            "sales_activities": len(activities),
        },
        "lead_distribution_by_source": (
            leads["source"].value_counts().sort_index().to_dict()
        ),
        "appointment_status_counts": status_counts,
        "average_lead_score": round(float(leads["lead_score"].mean()), 2),
        "booking_rate": round(len(bookings) / len(leads), 4),
        "show_rate": round(
            (bookings["appointment_status"] == "Showed").sum() / len(bookings),
            4,
        )
        if len(bookings)
        else 0,
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
    print("\nSynthetic data generation completed successfully.")


if __name__ == "__main__":
    main()
