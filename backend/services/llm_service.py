import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pipelines.command_pipeline import command_pipeline

async def ask_llm(query: str):
    loop = asyncio.get_running_loop()
    future = loop.create_future()
    
    def on_result(response):
        loop.call_soon_threadsafe(future.set_result, response)
        
    command_pipeline.handle_command(query, callback=on_result)
    return await future
