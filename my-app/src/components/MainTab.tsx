"use client";

import { useState } from "react";

const categories = ["전체", "카공", "보드게임", "커피챗", "기타"];

interface MainTabProps {
  onCategoryChange: (category: string) => void;
}

const MainTab: React.FC<MainTabProps> = ({ onCategoryChange }) => {
  const [activeTab, setActiveTab] = useState(categories[0]);

  const handleTabClick = (category: string) => {
    setActiveTab(category);
    onCategoryChange(category);
  };

  return (
    <div className="flex justify-center items-center md:space-x-[2rem] lg:space-x-[2.75rem] xl:space-x-[4rem]">
      {categories.map((category: string) => (
        <button
          key={category}
          className={`w-[5rem] lg:w-[8rem] text-base md:text-lg lg:text-lg font-semibold ${
            activeTab === category ? "text-black" : "text-darkgray"
          }`}
          onClick={() => handleTabClick(category)}
        >
          {category}
          {activeTab === category && (
            <div className="flex justify-center">
              <div className="w-[4rem] md:w-[5.5rem] h-0.5 my-1 bg-darkpink"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default MainTab;
