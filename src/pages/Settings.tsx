import { User, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountTabs from "@/components/settings/AccountTabs";
import WorkspaceTabs from "@/components/settings/WorkspaceTabs";

export default function Settings() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account">
        <TabsList variant="line">
          <TabsTrigger value="account">
            <User />
            Account
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building2 />
            Workspace
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountTabs />
        </TabsContent>
        <TabsContent value="workspace">
          <WorkspaceTabs />
        </TabsContent>
      </Tabs>
    </>
  );
}
