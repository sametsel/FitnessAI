from database.mongodb import create_collections, insert_test_data
import asyncio

async def main():
    await create_collections()
    await insert_test_data()

if __name__ == "__main__":
    asyncio.run(main()) 