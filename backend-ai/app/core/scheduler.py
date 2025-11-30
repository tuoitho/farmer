import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.database import get_database
from app.services.farm_service import FarmService
from app.services.notification_service import NotificationService
from app.services.weather_service import WeatherService


async def send_daily_weather_forecasts():
    """
    Fetches weather forecasts for all farms and sends notifications to users.
    This job is scheduled to run every day at a specific time.
    """
    db = get_database()
    farm_service = FarmService(db)
    weather_service = WeatherService()
    notification_service = NotificationService(db)

    print("Executing daily weather forecast job...")
    try:
        farms = await farm_service.get_all_farms()
        for farm in farms:
            try:
                weather_forecast = await weather_service.get_weather_forecast(farm.location)

                if weather_forecast.forecast_days:
                    today_forecast = weather_forecast.forecast_days[0]
                    summary = (
                        f"Nhiệt độ TB: {today_forecast.avg_temp}°C, "
                        f"Lượng mưa: {today_forecast.total_rainfall}mm, "
                        f"Điều kiện: {today_forecast.conditions}"
                    )

                    await notification_service.create_daily_weather_notification(
                        user_id=str(farm.user_id),
                        farm_name=farm.name,
                        weather_summary=summary
                    )
            except Exception as e:
                print(
                    f"Failed to process weather forecast for farm {farm.id}: {e}")
    except Exception as e:
        print(f"An error occurred during the daily weather forecast job: {e}")

scheduler = AsyncIOScheduler()


def initialize_scheduler():
    """
    Initializes and starts the scheduler.
    Adds the daily weather forecast job.
    """
    # Schedule the job to run every day at 7:00 AM
    scheduler.add_job(send_daily_weather_forecasts, 'cron', hour=7, minute=0)
    # scheduler.add_job(send_daily_weather_forecasts, 'interval', seconds=60)

    scheduler.start()
    print("Scheduler initialized and started.")


def shutdown_scheduler():
    """
    Shuts down the scheduler.
    """
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler shut down.")
