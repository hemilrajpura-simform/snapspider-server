# SnapSpider-server

SnapSpider-server is a backend service for taking screenshots of web pages, uploading them to Cloudinary, and managing screenshot requests via a REST API.

## Features

- Capture screenshots of web pages
- Upload screenshots to Cloudinary
- REST API for screenshot management
- Web crawler integration

## Project Structure

```
package.json
src/
  cloudinary.js      # Cloudinary upload logic
  crawler.js         # Web crawler logic
  server.js          # Express server and API endpoints
  screenshots/       # Directory for storing screenshots
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd SnapSpider-server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Configuration

- Set up your Cloudinary credentials in an environment file or directly in `src/cloudinary.js` as required.

### Running the Server

```sh
npm start
```

The server will start on the default port (check `src/server.js` for details).

## API Endpoints

- `POST /screenshot` - Take a screenshot of a given URL
- `GET /screenshots` - List all screenshots
- Additional endpoints may be available; see `src/server.js` for details.

## License

MIT
