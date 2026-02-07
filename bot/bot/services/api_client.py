"""HTTP client for backend API communication."""
import logging
from typing import Optional, List, Dict, Any
from functools import lru_cache
import httpx

from bot.config import get_settings

logger = logging.getLogger(__name__)


class APIClient:
    """Async HTTP client for F1 Time Machine backend API."""

    def __init__(self, base_url: str):
        """
        Initialize API client.

        Args:
            base_url: Base URL for the backend API
        """
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=30.0,
            headers={
                "User-Agent": "F1-Time-Machine-Bot/1.0"
            }
        )

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def get_today(self, year: int) -> Optional[Dict[str, Any]]:
        """
        Get today's historical F1 events.

        Args:
            year: F1 season year

        Returns:
            Dictionary with today's events or None
        """
        try:
            response = await self.client.get(f"/seasons/{year}/today")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"No data for today in season {year}")
                return None
            logger.error(f"HTTP error getting today's data: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting today's data: {e}")
            raise

    async def get_day(self, year: int, date: str) -> Optional[Dict[str, Any]]:
        """
        Get F1 events for a specific day.

        Args:
            year: F1 season year
            date: Date in YYYY-MM-DD format

        Returns:
            Dictionary with day's events or None
        """
        try:
            response = await self.client.get(f"/seasons/{year}/days/{date}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"No data for date {date} in season {year}")
                return None
            logger.error(f"HTTP error getting day data: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting day data: {e}")
            raise

    async def get_race(self, year: int, round_num: int) -> Optional[Dict[str, Any]]:
        """
        Get race details and results.

        Args:
            year: F1 season year
            round_num: Race round number

        Returns:
            Dictionary with race data or None
        """
        try:
            response = await self.client.get(f"/seasons/{year}/races/{round_num}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"No race found for round {round_num} in season {year}")
                return None
            logger.error(f"HTTP error getting race data: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting race data: {e}")
            raise

    async def get_standings(
        self,
        year: int,
        round_num: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get driver championship standings.

        Args:
            year: F1 season year
            round_num: Optional race round number (latest if not specified)

        Returns:
            Dictionary with standings data or None
        """
        try:
            endpoint = f"/seasons/{year}/standings"
            if round_num:
                endpoint += f"?round={round_num}"

            response = await self.client.get(endpoint)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"No standings found for round {round_num} in season {year}")
                return None
            logger.error(f"HTTP error getting standings: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting standings: {e}")
            raise

    async def get_active_subscribers(self) -> List[Dict[str, Any]]:
        """
        Get list of all active subscribers.

        Returns:
            List of subscriber dictionaries
        """
        try:
            response = await self.client.get("/subscribers?is_active=true")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting active subscribers: {e}")
            return []

    async def get_subscriber(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """
        Get subscriber details.

        Args:
            telegram_id: Telegram user ID

        Returns:
            Subscriber data or None
        """
        try:
            response = await self.client.get(f"/subscribers/{telegram_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"Subscriber {telegram_id} not found")
                return None
            logger.error(f"HTTP error getting subscriber: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting subscriber: {e}")
            raise

    async def register_subscriber(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new subscriber or update existing.

        Args:
            data: Subscriber data dictionary

        Returns:
            Created/updated subscriber data
        """
        try:
            response = await self.client.post("/subscribers", json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error registering subscriber: {e}")
            raise

    async def update_subscriber(
        self,
        telegram_id: int,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update subscriber settings.

        Args:
            telegram_id: Telegram user ID
            data: Updated fields

        Returns:
            Updated subscriber data
        """
        try:
            response = await self.client.patch(f"/subscribers/{telegram_id}", json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error updating subscriber: {e}")
            raise

    async def deactivate_subscriber(self, telegram_id: int) -> None:
        """
        Deactivate a subscriber.

        Args:
            telegram_id: Telegram user ID
        """
        try:
            await self.update_subscriber(telegram_id, {"is_active": False})
            logger.info(f"Deactivated subscriber {telegram_id}")
        except Exception as e:
            logger.error(f"Error deactivating subscriber: {e}")
            raise


@lru_cache()
def get_api_client() -> APIClient:
    """Get cached API client instance."""
    settings = get_settings()
    return APIClient(settings.backend_api_url)
