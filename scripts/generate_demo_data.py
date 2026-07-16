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
    },
    "Google Ads": {
        "weight": 0.12,
        "campaigns": ["High Intent Search", "Real Estate Mentorship"],
    },
    "Organic": {
        "weight": 0.16,
        "campaigns": ["Organic Content"],
    },
    "Referral": {
        "weight": 0.09,
        "campaigns": ["Partner Referral", "Client Referral"],
    },
    "Webinar": {
        "weight": 0.20,
        "campaigns": ["5-Day Investor Challenge", "VIP Webinar"],
    },
    "Email Campaign": {
        "weight": 0.05,
        "campaigns": ["Database Reactivation"],
    },
    "Direct": {
        "weight": 0.04,
        "campaigns": ["Direct Traffic"],
    },
}


def uid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def random_datetime(start: datetime, end: datetime) -> datetime:
    seconds = int((end - start).total_seconds())
    return start + timedelta(seconds=random.randint(0, seconds))


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


def validate_data(
    representatives: pd.DataFrame,
    leads: pd.DataFrame,
) -> None:
    if not representatives["representative_id"].is_unique:
        raise ValueError("representative_id contains duplicates")

    if not leads["lead_id"].is_unique:
        raise ValueError("lead_id contains duplicates")

    if len(leads) != N_LEADS:
        raise ValueError(f"Expected {N_LEADS} leads, found {len(leads)}")

    if not leads["lead_score"].between(1, 100).all():
        raise ValueError("lead_score contains values outside 1-100")


def main() -> None:
    print("Generating synthetic representatives and leads...")

    representatives = create_representatives()
    leads = create_leads()

    validate_data(representatives, leads)

    representatives.to_csv(
        DATA_DIR / "representatives.csv",
        index=False,
        encoding="utf-8",
    )
    leads.to_csv(
        DATA_DIR / "leads.csv",
        index=False,
        encoding="utf-8",
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
        },
        "lead_distribution_by_source": (
            leads["source"].value_counts().sort_index().to_dict()
        ),
        "average_lead_score": round(float(leads["lead_score"].mean()), 2),
    }

    with (DATA_DIR / "generation_summary.json").open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(summary, file, indent=2)

    print("Created:")
    print(f"- representatives.csv: {len(representatives):,} rows")
    print(f"- leads.csv: {len(leads):,} rows")
    print("- generation_summary.json")
    print("\nSynthetic data generation completed successfully.")


if __name__ == "__main__":
    main()
