import os
import csv
import time
import json
from kafka import KafkaProducer
from typing import Dict, Generator
from dotenv import load_dotenv
load_dotenv(override=True)
DATA_FOLDER = "./stock_data"
# BOOTSTRAP_SERVERS = "localhost:9093"

def get_csv_row_generator(filepath: str) -> Generator[Dict, None, None]:
    """
    Generator that yields one row at a time from a CSV file as a dict.
    """
    f = open(filepath, 'r')
    reader = csv.DictReader(f)
    try:
        for row in reader:
            yield row
    finally:
        f.close()

def simulate_stock_streaming(flag):
    """
    Streams one row per second per stock file to its respective Kafka topic.
    Assumes files are named <SYMBOL>.csv and reside in DATA_FOLDER.
    """
    # Create Kafka producer
    producer = KafkaProducer(
            bootstrap_servers= os.getenv('KAFKA_URI'),
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    # Prepare generators for each stock file
    generators: Dict[str, Generator] = {}
    for filename in os.listdir(DATA_FOLDER):
        if filename.endswith(".csv"):
            symbol = filename[:-4].upper()  # Strip .csv, uppercase symbol
            path = os.path.join(DATA_FOLDER, filename)
            generators[symbol] = get_csv_row_generator(path)

    print("✅ Stock streaming started.")
    try:
        while generators and flag.is_set():
            completed = []
            for symbol, gen in generators.items():
                try:
                    row = next(gen)
                    topic = f"{symbol.split('_today')[0].upper()}"
                    message = {"symbol": symbol, "data": row}
                    producer.send("live_stock_data", value=message, key=symbol.encode('utf-8'))
                    time.sleep(0.2)
                    # print(f"📤 [{symbol}] Sent to {topic}: {row}")
                except StopIteration:
                    print(f"✅ Completed streaming {symbol}")
                    completed.append(symbol)

            # Remove completed generators
            for symbol in completed:
                del generators[symbol]

            producer.flush()
            time.sleep(0.3)

    except KeyboardInterrupt:
        print("\n⛔ Interrupted by user.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        producer.close()
        print("🛑 Streaming finished. Kafka producer closed.")
