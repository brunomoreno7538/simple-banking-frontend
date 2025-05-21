import "./App.css";
import { BrowserRouter, Link } from "react-router-dom";
import { AppRoutes } from "./routes";

export const HomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="p-8 bg-white shadow-xl rounded-lg text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Simple Banking Assessment
      </h1>
      <p className="text-gray-600 mb-8">Please select your login type.</p>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              to="/core"
              className="block w-full px-6 py-3 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Core User Login
            </Link>
          </li>
          <li>
            <Link
              to="/merchant"
              className="block w-full px-6 py-3 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Merchant Login
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
