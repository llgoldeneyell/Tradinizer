# Tradinizer

Tradinizer is a full-stack web application that allows you to input trading values and visualize graphical representations of the data.  
The frontend is built with React (TypeScript) and the backend uses ASP.NET Core 9.

---

## Features

- Simple and intuitive interface to input trading data  
- Dynamic graphical visualization of entered data  
- Separate frontend/backend architecture for easy development and maintenance  
- Backend in C# with REST APIs for data management  
- React frontend with TypeScript for a modern and responsive user experience  

---

## Project Structure

```
/tradinizer
  /tradinizer.client       # React frontend (TSX)
  /tradinizer.server       # ASP.NET Core 9 backend
```

---

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) (to run and publish the backend)  
- [Node.js](https://nodejs.org/) (to develop and build the frontend)  
- npm or yarn (package manager for frontend)

---

## How to run locally

### Frontend

```bash
cd tradinizer.client
npm install
npm run dev
```

This will start the frontend in development mode with hot reload.

### Backend

```bash
cd tradinizer.server
dotnet run
```

The backend will be available at `https://localhost:5001` (or the configured port).

---

## How to build and publish

### Frontend build

In the frontend folder:

```bash
npm run build
```

This generates the `dist` folder with production-ready static files.

### Integrate frontend into backend

Copy the `dist` folder inside the backend project or configure the backend to serve static files from the correct path (e.g. `tradinizer.client/dist`).

### Backend publish

In the backend folder:

```bash
dotnet publish -c Release -o ./publish
```

This creates a deployment-ready package.

---

## Configuration

The backend port can be configured in `appsettings.json` under:

```json
{
  "AppSettings": {
    "Port": 5000
  }
}
```

You can change the port without recompiling the app.

---

## Notes

- The application is designed to work without Node.js installed in production (the frontend is served as static files by the backend).  
- For development, both Node.js and .NET SDK are required.

---

## License

[MIT](LICENSE)

---

If you have questions or want to contribute, feel free to open an issue or pull request!
