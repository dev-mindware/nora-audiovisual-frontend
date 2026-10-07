"use client";

import {
  Button,
  Icon,
  Separator,
  Switch,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components";
import { onboardingTours, type OnboardingTourId } from "@/constants/onboarding-tours";
import { useAuth } from "@/hooks/auth";
import { useOnboardingPreferencesStore } from "@/stores";
import { useOnboardingPreferencesPersistence } from "@/hooks/onboarding/use-onboarding-preferences";

function getOnboardingScope(userId?: string, companyId?: string) {
  return [companyId || "company", userId || "user"].join(":");
}

export function OnboardingPreferences() {
  const { user } = useAuth();
  const scope = getOnboardingScope(user?.id, user?.company?.id);
  const persistence = useOnboardingPreferencesPersistence(
    scope,
    Boolean(user?.id && user?.company?.id),
  );
  const scopedPreferences = useOnboardingPreferencesStore(
    (state) => state.preferencesByScope[scope],
  );
  const preferences = {
    autoStartEnabled: scopedPreferences?.autoStartEnabled ?? true,
    tourButtonEnabled: scopedPreferences?.tourButtonEnabled ?? true,
    seenTours: scopedPreferences?.seenTours ?? {},
  };
  const setAutoStartEnabled = useOnboardingPreferencesStore(
    (state) => state.setAutoStartEnabled,
  );
  const setTourButtonEnabled = useOnboardingPreferencesStore(
    (state) => state.setTourButtonEnabled,
  );
  const seenCount = Object.keys(preferences.seenTours).length;
  const totalTours = Object.keys(onboardingTours).length;
  const seenTourEntries = Object.entries(preferences.seenTours)
    .map(([tourId, status]) => {
      const id = tourId as OnboardingTourId;
      const tour = onboardingTours[id];
      if (!tour) return null;

      return {
        id,
        status,
        title: tour.title,
        priority: tour.priority,
        group: tour.group,
      };
    })
    .filter((tour): tour is NonNullable<typeof tour> => Boolean(tour))
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return (
    <div className="space-y-6" data-tour="setup-guides-content">
      <Card className="rounded-xs border border-border bg-card p-0 gap-0 shadow-none">
        <CardHeader className="p-5 border-b border-border">
          <CardTitle className="text-base font-semibold text-foreground">Guias &amp; Tours Orientados</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Defina quando os tutoriais interativos devem aparecer e repita-os sempre que necessário.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 text-primary">
                  <Icon name="Route" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Mostrar guias automaticamente</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Quando estiver activo, cada guia aparece uma vez por utilizador e fluxo.
                  </p>
                </div>
              </div>
            </div>

            <Switch
              checked={preferences.autoStartEnabled}
              onCheckedChange={(checked) => {
                setAutoStartEnabled(scope, checked);
                persistence.persistPreferences({ autoStartEnabled: checked });
              }}
              aria-label="Mostrar guias automaticamente"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary/10 text-primary">
                  <Icon name="CircleHelp" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Mostrar botão &ldquo;Ver guia&rdquo;</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Quando estiver desactivado, o botão manual deixa de aparecer nas páginas com guia.
                  </p>
                </div>
              </div>
            </div>

            <Switch
              checked={preferences.tourButtonEnabled}
              onCheckedChange={(checked) => {
                setTourButtonEnabled(scope, checked);
                persistence.persistPreferences({ tourButtonEnabled: checked });
              }}
              aria-label="Mostrar botão Ver guia"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">
                {seenCount} de {totalTours} guias visualizados ou concluídos
              </p>
              <p className="text-[11px] text-muted-foreground">
                A abertura automática e o botão manual podem ser controlados separadamente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xs text-xs font-semibold"
              onClick={() => {
                persistence.persistResetAllTours();
              }}
            >
              <Icon name="RotateCcw" className="h-3.5 w-3.5" />
              Repor todos os guias
            </Button>
          </div>

          {seenTourEntries.length > 0 && (
            <div className="space-y-3 pt-2">
              <Separator />
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-foreground">Guias concluídos</h3>
                <p className="text-[11px] text-muted-foreground">
                  Reponha apenas o guia que quer ver novamente.
                </p>
              </div>

              <div className="divide-y divide-border rounded-xs border border-border">
                {seenTourEntries.map((tour) => (
                  <div
                    key={tour.id}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{tour.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {tour.status === "completed" ? "Concluído" : "Ignorado"} • {tour.group}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xs text-xs font-medium h-7 px-2.5"
                      onClick={() => {
                        persistence.persistResetTour(tour.id);
                      }}
                    >
                      <Icon name="RotateCcw" className="h-3 w-3 mr-1" />
                      Repor
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
