# Fire Protection Review System

The **Fire Protection Review System** is a web-based application designed to facilitate the review and management of fire protection data for buildings. This system allows authorized users to input, review, and monitor fire protection details related to different building structures.

## Features

- User authentication and authorization.
- Database integration for storing building and fire protection-related data.
- API routes for various services like building data retrieval and review.
- Logging functionality to track application events.

## Project Structure

The project has the following structure:

```
building-application/
│
├── app/
│   ├── authentication/     # User 
│   ├── database/           # Database 
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Core services 
│   └── main.py             # Entry point for the application
├── requirements.txt        # List of required Python dependencies
└── .env                    # Environment variables
```

## Getting Started

### Prerequisites

- Python 3.11.0
- SQLite (for database management)

### Installation

1. Clone the repository:
    ```bash
    git clone "https://github.com/SAIN-CUBE/building-appplication.git"
    cd building-application
    ```

2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `building_env\Scripts\activate`
    ```

3. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up environment variables:
    Create a `.env` file in the root directory and configure the necessary variables (like database URI, secret keys, etc.).

### Usage

1. Run the application:
    ```bash
    python -m app.main
    ```

2. The application should now be accessible locally at `http://localhost:8000/` (or another port if configured).

### Database

The application uses an SQLite database (`building_application.db`) to store building and fire protection data.

### Steps
1. First register yourself using registration url.
2. Login using `Authorize` button present at the top right corner.
