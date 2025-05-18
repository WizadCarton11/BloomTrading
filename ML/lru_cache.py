import threading
import time
from collections import OrderedDict
from typing import Any, Callable, Optional

class LRUCache:
    def __init__(self, capacity: int = 10, ttl: Optional[int] = None, on_evict: Optional[Callable[[Any, Any], None]] = None):
        self.capacity = capacity
        self.ttl = ttl
        self.cache = OrderedDict()
        self.lock = threading.Lock()
        self.timestamps = {}
        self.on_evict = on_evict

    def _is_expired(self, key) -> bool:
        if self.ttl is None:
            return False
        inserted_at = self.timestamps.get(key, 0)
        return (time.time() - inserted_at) > self.ttl

    def get(self, key: Any) -> Optional[Any]:
        with self.lock:
            if key not in self.cache:
                return None
            if self._is_expired(key):
                self._evict(key)
                return None
            self.cache.move_to_end(key)
            return self.cache[key]

    def put(self, key: Any, value: Any) -> None:
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
                self.cache[key] = value
                self.timestamps[key] = time.time()
            else:
                self.cache[key] = value
                self.timestamps[key] = time.time()
                if len(self.cache) > self.capacity:
                    oldest_key, oldest_value = self.cache.popitem(last=False)
                    self.timestamps.pop(oldest_key, None)
                    if self.on_evict:
                        self.on_evict(oldest_key, oldest_value)

    def _evict(self, key: Any) -> None:
        """Remove a specific key from cache (called internally)."""
        value = self.cache.pop(key, None)
        self.timestamps.pop(key, None)
        if self.on_evict and value is not None:
            self.on_evict(key, value)

    def clear(self) -> None:
        """Clear the entire cache."""
        with self.lock:
            keys = list(self.cache.keys())
            for key in keys:
                self._evict(key)

    def set_capacity(self, new_capacity: int) -> None:
        """Dynamically update cache capacity."""
        with self.lock:
            self.capacity = new_capacity
            while len(self.cache) > self.capacity:
                oldest_key, oldest_value = self.cache.popitem(last=False)
                self.timestamps.pop(oldest_key, None)
                if self.on_evict:
                    self.on_evict(oldest_key, oldest_value)

    def __len__(self):
        return len(self.cache)
