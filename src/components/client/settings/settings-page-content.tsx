'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TitleList } from '@/components';
import {
  User,
  CreditCard,
  Shield,
  FileCheck,
  Users,
  Palette,
  Route,
  Columns3,
} from 'lucide-react';
import { useAuthStore } from '@/stores';
import { ProfileSettingsTab } from './profile-settings-tab';
import { OrganizationSettingsTab } from './organization-settings-tab';
import { KanbanSettingsTab } from './kanban-settings-tab';
import { SubscriptionSettingsTab } from './subscription-settings-tab';
import { SecuritySettingsTab } from './security-settings-tab';
import { MindgestSettingsTab } from './mindgest-settings-tab';
import { TeamPageContent } from './team-page-content';
import { Appearance } from '@/components/templates/definitions/contents/appearance';
import { OnboardingPreferences } from '@/components/templates/definitions/contents/onboarding-preferences';

type SettingsTab =
  | 'profile'
  | 'kanban'
  | 'appearance'
  | 'guides'
  | 'subscription'
  | 'security'
  | 'mindgest'
  | 'team';

const ROLE_ALLOWED_TABS: Record<string, SettingsTab[]> = {
  OWNER: ['profile', 'kanban', 'appearance', 'guides', 'subscription', 'security', 'mindgest', 'team'],
  ADMIN: ['profile', 'kanban', 'appearance', 'guides', 'subscription', 'security', 'mindgest', 'team'],
  MANAGER: ['profile', 'kanban', 'appearance', 'guides', 'subscription', 'security', 'mindgest', 'team'],
  PRODUCER: ['profile', 'kanban', 'appearance', 'guides'],
  FINANCE: ['profile', 'appearance', 'guides', 'mindgest'],
  CREW: ['profile', 'appearance', 'guides'],
  EDITOR: ['profile', 'appearance', 'guides'],
  MEMBER: ['profile', 'appearance', 'guides'],
  CLIENT: ['profile', 'appearance', 'guides'],
};

export function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const userRole = (user?.role || 'MEMBER').toUpperCase();

  const allowedTabs = ROLE_ALLOWED_TABS[userRole] || ['profile', 'appearance', 'guides'];
  const canManageOrg = ['OWNER', 'ADMIN', 'MANAGER', 'PRODUCER', 'FINANCE'].includes(userRole);

  const rawTabParam = searchParams.get('tab');
  // Compatibilidade com links antigos que usavam ?tab=organization
  const normalizedParam = rawTabParam === 'organization' ? 'profile' : rawTabParam;
  const isInitialAllowed = normalizedParam && allowedTabs.includes(normalizedParam as SettingsTab);
  const initialTab = isInitialAllowed ? (normalizedParam as SettingsTab) : 'profile';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const target = rawTabParam === 'organization' ? 'profile' : rawTabParam;
    if (target && allowedTabs.includes(target as SettingsTab)) {
      setActiveTab(target);
    } else if (target && !allowedTabs.includes(target as SettingsTab)) {
      // Bloqueio RBAC: se utilizador tentar forçar uma aba não permitida, cai em profile
      setActiveTab('profile');
      router.replace('/settings?tab=profile', { scroll: false });
    }
  }, [rawTabParam, allowedTabs, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/settings?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-6 w-full">
      <TitleList
        title="Configurações da Produtora"
        suTitle="Gestão de perfil, dados da empresa, aparência, guias, subscrição, segurança e integrações."
      />

      {/* Tabs Container */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-6"
      >
        <div className="border-b border-border pb-1 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-1.5 flex flex-nowrap">
            {allowedTabs.includes('profile') && (
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <User className="h-3.5 w-3.5" /> {canManageOrg ? 'Perfil & Produtora' : 'Meu Perfil'}
              </TabsTrigger>
            )}

            {allowedTabs.includes('kanban') && (
              <TabsTrigger
                value="kanban"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <Columns3 className="h-3.5 w-3.5" /> Fluxo Kanban
              </TabsTrigger>
            )}

            {allowedTabs.includes('appearance') && (
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <Palette className="h-3.5 w-3.5" /> Aparência
              </TabsTrigger>
            )}

            {allowedTabs.includes('guides') && (
              <TabsTrigger
                value="guides"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <Route className="h-3.5 w-3.5" /> Guias &amp; Tours
              </TabsTrigger>
            )}

            {allowedTabs.includes('subscription') && (
              <TabsTrigger
                value="subscription"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <CreditCard className="h-3.5 w-3.5" /> Subscrição &amp; Faturação
              </TabsTrigger>
            )}

            {allowedTabs.includes('security') && (
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <Shield className="h-3.5 w-3.5" /> Segurança &amp; Acessos
              </TabsTrigger>
            )}

            {allowedTabs.includes('mindgest') && (
              <TabsTrigger
                value="mindgest"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <FileCheck className="h-3.5 w-3.5" /> Faturação Fiscal AGT
              </TabsTrigger>
            )}

            {allowedTabs.includes('team') && (
              <TabsTrigger
                value="team"
                className="data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none text-xs gap-1.5 py-1.5 px-3 rounded-xs font-medium"
              >
                <Users className="h-3.5 w-3.5" /> Equipa &amp; Permissões
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab Panels */}
        {allowedTabs.includes('profile') && (
          <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
            {canManageOrg ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
                <ProfileSettingsTab />
                <OrganizationSettingsTab />
              </div>
            ) : (
              <div className="max-w-2xl w-full">
                <ProfileSettingsTab />
              </div>
            )}
          </TabsContent>
        )}

        {allowedTabs.includes('kanban') && (
          <TabsContent value="kanban" className="mt-0 focus-visible:outline-none">
            <KanbanSettingsTab />
          </TabsContent>
        )}

        {allowedTabs.includes('appearance') && (
          <TabsContent value="appearance" className="mt-0 focus-visible:outline-none">
            <Appearance />
          </TabsContent>
        )}

        {allowedTabs.includes('guides') && (
          <TabsContent value="guides" className="mt-0 focus-visible:outline-none">
            <OnboardingPreferences />
          </TabsContent>
        )}

        {allowedTabs.includes('subscription') && (
          <TabsContent value="subscription" className="mt-0 focus-visible:outline-none">
            <SubscriptionSettingsTab />
          </TabsContent>
        )}

        {allowedTabs.includes('security') && (
          <TabsContent value="security" className="mt-0 focus-visible:outline-none">
            <SecuritySettingsTab />
          </TabsContent>
        )}

        {allowedTabs.includes('mindgest') && (
          <TabsContent value="mindgest" className="mt-0 focus-visible:outline-none">
            <MindgestSettingsTab />
          </TabsContent>
        )}

        {allowedTabs.includes('team') && (
          <TabsContent value="team" className="mt-0 focus-visible:outline-none">
            <TeamPageContent />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
