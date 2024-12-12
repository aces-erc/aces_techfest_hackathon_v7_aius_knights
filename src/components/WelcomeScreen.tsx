import React from "react";
import SignIn from "./SignIn";
import bg from "../images/bg.jpg";

const WelcomeScreen: React.FC = () => (
  <div className="flex items-center justify-center h-screen overflow-hidden">
    {/* Image Section */}
    <div className="flex-1 flex justify-start items-start">
      <img src={bg} alt="Photo" className="w-full h-full object-cover" />
    </div>

    {/* Content Section */}
    <div className="flex-1 text-center">
      <div className="mb-12">
        <h1 className="text-2xl lg:text-4xl font-bold">
          Welcome To Kind Space
        </h1>
        <h3 className="text-lg text-gray-600">Connect With Compassion!</h3>
      </div>
      <SignIn />
    </div>
  </div>
);

export default WelcomeScreen;
