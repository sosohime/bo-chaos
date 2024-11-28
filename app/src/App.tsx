import '@/styles/global.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const App = () => {
  return (
    <div className="content mr20">
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Acco123unt</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
