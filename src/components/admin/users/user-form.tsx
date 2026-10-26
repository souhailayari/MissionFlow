"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Building2, ContactRound, KeyRound, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

import type {
  AdminDepartment,
  AdminTeam,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UserFormMode,
} from "@/types/admin";
import type { DepartmentRole, GlobalRole } from "@/types/auth";

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  matricule: string;
  function: string;
  globalRole: string;
  departmentRole: string;
  departmentId: string;
  teamId: string;
};

const emptyValues = (): UserFormValues => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  matricule: "",
  function: "",
  globalRole: "",
  departmentRole: "",
  departmentId: "",
  teamId: "",
});

const toFormValues = (source?: Partial<UserFormValues>): UserFormValues => ({
  firstName: source?.firstName ?? "",
  lastName: source?.lastName ?? "",
  email: source?.email ?? "",
  password: source?.password ?? "",
  matricule: source?.matricule ?? "",
  function: source?.function ?? "",
  globalRole: source?.globalRole ?? "",
  departmentRole: source?.departmentRole ?? "",
  departmentId: source?.departmentId ?? "",
  teamId: source?.teamId ?? "",
});

const buildRolePayload = (values: UserFormValues) => {
  const base: Partial<CreateAdminUserPayload> = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    ...(values.matricule.trim() ? { matricule: values.matricule.trim() } : {}),
    ...(values.function.trim() ? { function: values.function.trim() } : {}),
    ...(values.departmentId ? { departmentId: values.departmentId } : {}),
    ...(values.teamId ? { teamId: values.teamId } : {}),
  };

  if (values.globalRole) {
    return {
      ...base,
      globalRole: values.globalRole as GlobalRole,
      departmentRole: undefined,
      departmentId: undefined,
      teamId: undefined,
    };
  }

  if (values.departmentRole) {
    return {
      ...base,
      departmentRole: values.departmentRole as DepartmentRole,
      globalRole: undefined,
    };
  }

  return {
    ...base,
    globalRole: undefined,
    departmentRole: undefined,
  };
};

export function UserForm({
  departments,
  teams,
  mode,
  presentation = "inline",
  initialValues,
  onCancel,
  onSubmit,
}: Readonly<{
  departments: AdminDepartment[];
  teams: AdminTeam[];
  mode: UserFormMode;
  presentation?: "inline" | "dialog";
  initialValues?: Partial<UserFormValues>;
  onCancel?: () => void;
  onSubmit: (payload: CreateAdminUserPayload | UpdateAdminUserPayload) => Promise<void>;
}>) {
  const [values, setValues] = useState<UserFormValues>(() => toFormValues(initialValues));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTeams = useMemo(() => {
    if (!values.departmentId) {
      return [];
    }

    return teams.filter((team) => team.departmentId === values.departmentId);
  }, [teams, values.departmentId]);

  const set = (key: keyof UserFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleGlobalRoleChange = (globalRole: string) => {
    setValues((current) => ({
      ...current,
      globalRole,
      departmentRole: "",
      departmentId: "",
      teamId: "",
    }));
  };

  const handleDepartmentRoleChange = (departmentRole: string) => {
    setValues((current) => ({
      ...current,
      departmentRole,
      globalRole: "",
      departmentId: "",
      teamId: "",
    }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setValues((current) => ({
      ...current,
      departmentId,
      teamId: "",
    }));
  };

  const validate = () => {
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return "Prénom, nom et email sont obligatoires.";
    }

    if (values.globalRole) {
      if (values.departmentRole || values.departmentId || values.teamId) {
        return "Un rôle global ne peut pas être associé à un département ou une équipe.";
      }
      return null;
    }

    if (!values.departmentRole) {
      return "Un utilisateur doit avoir un rôle global ou un rôle département.";
    }

    if (!values.departmentId) {
      return "Le département est obligatoire pour un rôle département.";
    }

    if (values.departmentRole === "CHEF_EQUIPE" && !values.teamId) {
      return "Un chef d'équipe doit avoir une équipe.";
    }

    if (values.teamId) {
      const teamExists = teams.some((team) => team.id === values.teamId && team.departmentId === values.departmentId);
      if (!teamExists) {
        return "L'équipe sélectionnée doit appartenir au département choisi.";
      }
    }

    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim().toLowerCase();
    const password = values.password.trim();

    const payload: CreateAdminUserPayload | UpdateAdminUserPayload = {
      ...buildRolePayload(values),
      firstName,
      lastName,
      email,
      ...(mode === "create" ? { password: password || "" } : {}),
      ...(password && mode === "edit" ? { password } : {}),
    };

    if (mode === "create" && !password) {
      setError("Le mot de passe est obligatoire pour la création.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(payload);
      if (mode === "create") {
        setValues(emptyValues());
      }
      if (mode === "edit" && onCancel) {
        onCancel();
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Une erreur est survenue lors de l'enregistrement.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (presentation === "dialog") {
    return (
      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {error && <Alert tone="danger" role="alert">{error}</Alert>}

          <FormSection id="account-section" title="Informations du compte" description="Identité et coordonnées de connexion." icon={ContactRound}>
            <UserField id="lastName" label="Nom">
              <Input id="lastName" required autoComplete="family-name" value={values.lastName} onChange={(event) => set("lastName", event.target.value)} />
            </UserField>
            <UserField id="firstName" label="Prénom">
              <Input id="firstName" required autoComplete="given-name" value={values.firstName} onChange={(event) => set("firstName", event.target.value)} />
            </UserField>
            <div className="sm:col-span-2">
              <UserField id="email" label="Email">
                <Input id="email" required type="email" autoComplete="email" value={values.email} onChange={(event) => set("email", event.target.value)} />
              </UserField>
            </div>
          </FormSection>

          <FormSection id="access-section" title="Accès et profil" description="Définissez les identifiants et le rôle global." icon={KeyRound}>
            <div className="sm:col-span-2">
              <UserField id="password" label={mode === "create" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"}>
                <Input id="password" required={mode === "create"} minLength={8} type="password" autoComplete="new-password" value={values.password} onChange={(event) => set("password", event.target.value)} />
              </UserField>
            </div>
            <UserField id="matricule" label="Matricule">
              <Input id="matricule" value={values.matricule} onChange={(event) => set("matricule", event.target.value)} />
            </UserField>
            <UserField id="function" label="Fonction">
              <Input id="function" value={values.function} onChange={(event) => set("function", event.target.value)} />
            </UserField>
            <div className="sm:col-span-2">
              <UserField id="globalRole" label="Rôle global">
                <Select id="globalRole" value={values.globalRole} onChange={(event) => handleGlobalRoleChange(event.target.value)}>
                  <option value="">Aucun</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="RH">RH</option>
                  <option value="DIRECTION">DIRECTION</option>
                </Select>
              </UserField>
            </div>
          </FormSection>

          <FormSection id="assignment-section" title="Affectation" description="Rattachez l’utilisateur à un rôle et à une équipe." icon={Building2}>
            <UserField id="departmentRole" label="Rôle département">
              <Select id="departmentRole" value={values.departmentRole} disabled={Boolean(values.globalRole)} onChange={(event) => handleDepartmentRoleChange(event.target.value)}>
                <option value="">Aucun</option>
                <option value="EMPLOYE">EMPLOYE</option>
                <option value="CHEF_EQUIPE">CHEF_EQUIPE</option>
                <option value="DIRECTEUR_DEPARTEMENT">DIRECTEUR_DEPARTEMENT</option>
              </Select>
            </UserField>
            <UserField id="departmentId" label="Département">
              <Select id="departmentId" value={values.departmentId} disabled={Boolean(values.globalRole)} onChange={(event) => handleDepartmentChange(event.target.value)}>
                <option value="">Sélectionner</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </Select>
            </UserField>
            <div className="sm:col-span-2">
              <UserField id="teamId" label="Équipe">
                <Select id="teamId" value={values.teamId} disabled={Boolean(values.globalRole) || !values.departmentId} onChange={(event) => set("teamId", event.target.value)}>
                  <option value="">Sélectionner</option>
                  {filteredTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </Select>
              </UserField>
            </div>
          </FormSection>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/90 px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Annuler</Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? (mode === "create" ? "Création en cours..." : "Enregistrement...")
              : (mode === "create" ? "Créer l'utilisateur" : "Enregistrer les modifications")}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Card>
      <CardTitle>{mode === "create" ? "Créer un utilisateur" : "Modifier un utilisateur"}</CardTitle>

      {error && (
        <div className="mt-4">
          <Alert tone="danger" role="alert">{error}</Alert>
        </div>
      )}

      <form
        className="mt-5 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input required placeholder="Prénom" value={values.firstName} onChange={(event) => set("firstName", event.target.value)} />
        <Input required placeholder="Nom" value={values.lastName} onChange={(event) => set("lastName", event.target.value)} />
        <Input required type="email" placeholder="Email" value={values.email} onChange={(event) => set("email", event.target.value)} />
        <Input type="password" minLength={8} placeholder={mode === "create" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"} value={values.password} onChange={(event) => set("password", event.target.value)} />
        <Input placeholder="Matricule" value={values.matricule} onChange={(event) => set("matricule", event.target.value)} />
        <Input placeholder="Fonction" value={values.function} onChange={(event) => set("function", event.target.value)} />

        <Select value={values.globalRole} onChange={(event) => handleGlobalRoleChange(event.target.value)}>
          <option value="">Rôle global</option>
          <option value="ADMIN">ADMIN</option>
          <option value="RH">RH</option>
          <option value="DIRECTION">DIRECTION</option>
        </Select>

        <Select value={values.departmentRole} disabled={Boolean(values.globalRole)} onChange={(event) => handleDepartmentRoleChange(event.target.value)}>
          <option value="">Rôle département</option>
          <option value="EMPLOYE">EMPLOYE</option>
          <option value="CHEF_EQUIPE">CHEF_EQUIPE</option>
          <option value="DIRECTEUR_DEPARTEMENT">DIRECTEUR_DEPARTEMENT</option>
        </Select>

        <Select value={values.departmentId} disabled={Boolean(values.globalRole)} onChange={(event) => handleDepartmentChange(event.target.value)}>
          <option value="">Département</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>{department.name}</option>
          ))}
        </Select>

        <Select value={values.teamId} disabled={Boolean(values.globalRole) || !values.departmentId} onChange={(event) => set("teamId", event.target.value)}>
          <option value="">Équipe</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </Select>

        <div className="flex gap-3 md:col-span-2">
          {mode === "edit" && onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? (mode === "create" ? "Création..." : "Enregistrement...") : (mode === "create" ? "Créer" : "Enregistrer")} 
          </Button>
        </div>
      </form>
    </Card>
  );
}

function UserField({ id, label, children }: Readonly<{ id: string; label: string; children: React.ReactNode }>) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function FormSection({ id, title, description, icon: Icon, children }: Readonly<{ id: string; title: string; description: string; icon: LucideIcon; children: ReactNode }>) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 id={id} className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
