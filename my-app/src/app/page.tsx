import Image from "next/image";
import { redirect } from "next/navigation";

const Home = () => {
  redirect("/login");
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-row min-h-screen justify-center p-24"></div>
    </main>
  );
};

export default Home;
