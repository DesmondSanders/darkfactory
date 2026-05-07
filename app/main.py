import argparse
from app.scheduler import start_scheduler
from app.pipeline import run_weekly_generation, run_weekly_analytics


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['schedule', 'run-once', 'analytics-once'])
    args = parser.parse_args()

    if args.command == 'schedule':
        start_scheduler()
    elif args.command == 'run-once':
        run_weekly_generation()
    elif args.command == 'analytics-once':
        run_weekly_analytics()


if __name__ == '__main__':
    main()
