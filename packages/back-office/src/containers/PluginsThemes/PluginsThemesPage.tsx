// src/pages/PluginsThemesPage.tsx
import SideHeader from "@/components/SideHeader/SideHeader.tsx";
import InfoHeader from "@/components/InfoHeader/InfoHeader.tsx";
import CustomGrid from "@/components/CustomGrid/CustomGrid.tsx";
import { useEffect, useMemo, useState } from "react";
import { getAllJavaPlugins, getAllJavaVersions } from "@/infrastructure/repositories/java.repository.ts";
import { JavaVersionModel } from "@/domain/models/java-version.model";
import { JavaPluginModel } from "@/domain/models/java-plugin.model";
import { h } from "gridjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { deleteJavaPlugin, updateJavaPlugin } from "@/infrastructure/repositories/java.repository";
import { postJavaPlugin } from "@/infrastructure/repositories/java.repository";
import { postJavaVersion, updateJavaVersion, deleteJavaVersion } from "@/infrastructure/repositories/java.repository";

function EditPluginForm({ plugin, onCancel, onSuccess }: { plugin: JavaPluginModel, onCancel: () => void, onSuccess: () => void }) {
  const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    version: z.string().min(1, "La version est requise"),
    description: z.string().min(1, "La description est requise"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (values: { name: string; version: string; description: string }) => {
    setSubmitting(true);
    try {
      await updateJavaPlugin(plugin.id, values);
      onSuccess();
    } catch (e) {
      // TODO: afficher une erreur
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>Annuler</Button>
          <Button type="submit" variant="blue" disabled={submitting}>Enregistrer</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function PluginsThemesPage() {
  const [plugins, setPlugins] = useState<JavaPluginModel[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<JavaPluginModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [javaVersions, setJavaVersions] = useState<JavaVersionModel[]>([]);
  const [editPlugin, setEditPlugin] = useState<JavaPluginModel | null>(null);
  const [deletePlugin, setDeletePlugin] = useState<JavaPluginModel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editJavaVersion, setEditJavaVersion] = useState<JavaVersionModel | null>(null);
  const [deleteJavaVersionDialog, setDeleteJavaVersionDialog] = useState<JavaVersionModel | null>(null);
  const [addJavaVersionDialogOpen, setAddJavaVersionDialogOpen] = useState(false);

  function cloneDeep<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllJavaPlugins(), getAllJavaVersions()])
      .then(([pluginsData, versionsData]) => {
        setPlugins(
          cloneDeep(Array.isArray(pluginsData) ? pluginsData : pluginsData?.data ?? [])
        );
        setJavaVersions(
          cloneDeep(Array.isArray(versionsData) ? versionsData : versionsData?.data ?? [])
        );
      })
      .catch(() =>
        setError("Erreur lors du chargement des plugins ou des versions Java.")
      )
      .finally(() => setLoading(false));
  }, []);

  const dateFormatter = (cell: string | number) => {
    const date = new Date(cell as string);
    return h(
      "span",
      {},
      date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    );
  };

  const fileFormatter = (cell: string | number) => {
    if (typeof cell !== "string") {
      return h("span", {});
    }
    const [fileName, fileUrl] = cell.split("|||");
    return h(
      "a",
      {
        href: fileUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-blue-600 underline",
      },
      fileName
    );
  };

  const actionFormatter = (cell: string | number) => {
    const plugin = plugins.find((p) => p.id === Number(cell));
    if (!plugin) {
      return h("span", {});
    }
    return h(
      "div",
      { className: "flex gap-2" },

      h(
        "button",
        {
          className:
            "flex items-center gap-1 px-2 py-1 rounded border border-blue text-blue bg-white hover:bg-blue-50 transition-colors",
          style: { cursor: "pointer" },
          title: "Détails",
          onClick: () => setSelectedPlugin(plugin),
        },
        h("span", { className: "material-icons", style: { fontSize: "18px" } }, "info"),
        "Détails"
      ),

      h(
        "button",
        {
          className:
            "flex items-center gap-1 px-2 py-1 rounded border border-yellow-600 text-yellow-600 bg-white hover:bg-yellow-50 transition-colors",
          style: { cursor: "pointer" },
          title: "Modifier",
          onClick: () => setEditPlugin(plugin),
        },
        h("span", { className: "material-icons", style: { fontSize: "18px" } }, "edit"),
        "Modifier"
      ),

      h(
        "button",
        {
          className:
            "flex items-center gap-1 px-2 py-1 rounded border border-red-600 text-red-600 bg-white hover:bg-red-50 transition-colors",
          style: { cursor: "pointer" },
          title: "Supprimer",
          onClick: () => setDeletePlugin(plugin),
        },
        h("span", { className: "material-icons", style: { fontSize: "18px" } }, "delete"),
        "Supprimer"
      ),

      h(
        "a",
        {
          href: plugin.fileUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "flex items-center gap-1 px-2 py-1 rounded border border-green-600 text-green-600 bg-white hover:bg-green-50 transition-colors",
          style: { cursor: "pointer" },
          title: "Télécharger",
        },
        h("span", { className: "material-icons", style: { fontSize: "18px" } }, "download"),
        "Télécharger"
      )
    );
  };

  const pluginsData = useMemo(
    () =>
      (plugins ?? []).map((p) => [
        String(p.uploadedAt),
        String(p.name),
        String(p.description),
        String(p.version),
        `${p.fileName}|||${p.fileUrl}`,
        String(p.id),
      ]),
    [plugins]
  );

  const pluginColumns = useMemo(
    () => [
      { name: "Date", formatter: dateFormatter },
      { name: "Nom" },
      { name: "Description" },
      { name: "Version" },
      { name: "Fichier", formatter: fileFormatter },
      {
        name: "Actions",
        formatter: actionFormatter,
        attributes: { style: "width: 180px; min-width: 180px;" },
      },
    ],
    [plugins]
  );

  const javaVersionsData = useMemo(
    () =>
      (javaVersions ?? []).map((v) => [
        String(v.uploadedAt),
        String(v.version),
        String(v.fileName),
        `${v.fileName}|||${v.fileUrl}`,
        String(v.id),
      ]),
    [javaVersions]
  );

  const javaVersionColumns = useMemo(
    () => [
      { name: "Date", formatter: dateFormatter },
      { name: "Version" },
      { name: "Nom du fichier" },
      { name: "Fichier", formatter: fileFormatter },
      {
        name: "Actions",
        formatter: (cell: string | number) => {
          const version = javaVersions.find((v) => v.id === Number(cell));
          if (!version) return h("span", {});
          return h(
            "div",
            { className: "flex gap-2" },
            h(
              "button",
              {
                className:
                  "flex items-center gap-1 px-2 py-1 rounded border border-yellow-600 text-yellow-600 bg-white hover:bg-yellow-50 transition-colors",
                style: { cursor: "pointer" },
                title: "Modifier",
                onClick: () => setEditJavaVersion(version),
              },
              h("span", { className: "material-icons", style: { fontSize: "18px" } }, "edit"),
              "Modifier"
            ),
            h(
              "button",
              {
                className:
                  "flex items-center gap-1 px-2 py-1 rounded border border-red-600 text-red-600 bg-white hover:bg-red-50 transition-colors",
                style: { cursor: "pointer" },
                title: "Supprimer",
                onClick: () => setDeleteJavaVersionDialog(version),
              },
              h("span", { className: "material-icons", style: { fontSize: "18px" } }, "delete"),
              "Supprimer"
            ),
            h(
              "a",
              {
                href: version.fileUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "flex items-center gap-1 px-2 py-1 rounded border border-green-600 text-green-600 bg-white hover:bg-green-50 transition-colors",
                style: { cursor: "pointer" },
                title: "Télécharger",
              },
              h("span", { className: "material-icons", style: { fontSize: "18px" } }, "download"),
              "Télécharger"
            )
          );
        },
        attributes: { style: "width: 180px; min-width: 180px;" },
      },
    ],
    [javaVersions]
  );

  return (
    <div className="flex min-h-screen w-full">
      <SideHeader />
      <main className="flex flex-col flex-1">
        <InfoHeader
          title={"Plugins Java"}
          description={"Gérez, téléchargez ou vérifiez les plugins .jar de l'application."}
        />
        <div className="p-8">
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Versions Java</h2>
              </div>
              <CustomGrid data={javaVersionsData} columns={javaVersionColumns} />
              <div className="flex items-center justify-between mt-8 mb-2">
                <h2 className="text-lg font-bold">Plugins Java</h2>
                <Button variant="blue" onClick={() => setAddJavaVersionDialogOpen(true)}>
                  <span className="material-icons mr-1" style={{ fontSize: 20 }}>add</span>
                  Ajouter une version
                </Button>
              </div>

              <CustomGrid data={pluginsData} columns={pluginColumns} />
              <div className="flex flex-col items-end mt-4">
                <Button variant="blue" onClick={() => setAddDialogOpen(true)}>
                  <span className="material-icons mr-1" style={{ fontSize: 20 }}>add</span>
                  Ajouter un plugin
                </Button>
              </div>
              
            </>
          )}
        </div>
        {selectedPlugin && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedPlugin(null)}
          >
            <div
              className="relative bg-white p-4 rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-700 hover:text-black text-2xl font-bold"
                onClick={() => setSelectedPlugin(null)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">{selectedPlugin.name}</h2>
              <p className="mb-1">
                <b>Version :</b> {selectedPlugin.version}
              </p>
              <p className="mb-1">
                <b>Description :</b> {selectedPlugin.description}
              </p>
              <p className="mb-1">
                <b>Fichier :</b> {selectedPlugin.fileName}
              </p>
              <p className="mb-1">
                <b>Date d'upload :</b>{" "}
                {new Date(selectedPlugin.uploadedAt).toLocaleString()}
              </p>
              <a
                href={selectedPlugin.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm text-center"
              >
                Télécharger le .jar
              </a>
            </div>
          </div>
        )}
        {editPlugin && (
          <Dialog open={!!editPlugin} onOpenChange={(open) => !open && setEditPlugin(null)}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Modifier le plugin</DialogTitle>
              </DialogHeader>
              <EditPluginForm
                plugin={editPlugin}
                onCancel={() => setEditPlugin(null)}
                onSuccess={async () => {
                  setEditPlugin(null);
                  setLoading(true);
                  const pluginsData = await getAllJavaPlugins();
                  setPlugins(cloneDeep(Array.isArray(pluginsData) ? pluginsData : pluginsData?.data ?? []));
                  setLoading(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
        {deletePlugin && (
          <Dialog open={!!deletePlugin} onOpenChange={(open) => !open && setDeletePlugin(null)}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Supprimer le plugin</DialogTitle>
              </DialogHeader>
              <p>Êtes-vous sûr de vouloir supprimer le plugin <b>{deletePlugin.name}</b> ?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeletePlugin(null)} disabled={actionLoading}>Annuler</Button>
                <Button variant="destructive" onClick={async () => {
                  setActionLoading(true);
                  try {
                    await deleteJavaPlugin(deletePlugin.id);
                    setDeletePlugin(null);
                    setLoading(true);
                    const pluginsData = await getAllJavaPlugins();
                    setPlugins(cloneDeep(Array.isArray(pluginsData) ? pluginsData : pluginsData?.data ?? []));
                    setLoading(false);
                  } catch (e) {
                    setError("Erreur lors de la suppression du plugin.");
                  } finally {
                    setActionLoading(false);
                  }
                }} disabled={actionLoading}>Supprimer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {/* Dialogs Java Version */}
        <Dialog open={addJavaVersionDialogOpen} onOpenChange={setAddJavaVersionDialogOpen}>
          <DialogContent onClick={e => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Ajouter une version Java</DialogTitle>
            </DialogHeader>
            <AddJavaVersionForm
              onCancel={() => setAddJavaVersionDialogOpen(false)}
              onSuccess={async () => {
                setAddJavaVersionDialogOpen(false);
                setLoading(true);
                const versionsData = await getAllJavaVersions();
                setJavaVersions(cloneDeep(Array.isArray(versionsData) ? versionsData : versionsData?.data ?? []));
                setLoading(false);
              }}
            />
          </DialogContent>
        </Dialog>
        {editJavaVersion && (
          <Dialog open={!!editJavaVersion} onOpenChange={(open) => !open && setEditJavaVersion(null)}>
            <DialogContent onClick={e => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Modifier la version Java</DialogTitle>
              </DialogHeader>
              <EditJavaVersionForm
                version={editJavaVersion}
                onCancel={() => setEditJavaVersion(null)}
                onSuccess={async () => {
                  setEditJavaVersion(null);
                  setLoading(true);
                  const versionsData = await getAllJavaVersions();
                  setJavaVersions(cloneDeep(Array.isArray(versionsData) ? versionsData : versionsData?.data ?? []));
                  setLoading(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
        {deleteJavaVersionDialog && (
          <Dialog open={!!deleteJavaVersionDialog} onOpenChange={(open) => !open && setDeleteJavaVersionDialog(null)}>
            <DialogContent onClick={e => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Supprimer la version Java</DialogTitle>
              </DialogHeader>
              <p>Êtes-vous sûr de vouloir supprimer la version <b>{deleteJavaVersionDialog.version}</b> ?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteJavaVersionDialog(null)} disabled={actionLoading}>Annuler</Button>
                <Button variant="destructive" onClick={async () => {
                  setActionLoading(true);
                  try {
                    await deleteJavaVersion(deleteJavaVersionDialog.id);
                    setDeleteJavaVersionDialog(null);
                    setLoading(true);
                    const versionsData = await getAllJavaVersions();
                    setJavaVersions(cloneDeep(Array.isArray(versionsData) ? versionsData : versionsData?.data ?? []));
                    setLoading(false);
                  } catch (e) {
                    setError("Erreur lors de la suppression de la version Java.");
                  } finally {
                    setActionLoading(false);
                  }
                }} disabled={actionLoading}>Supprimer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
      {/* Dialog d'ajout */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent onClick={e => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Ajouter un plugin Java</DialogTitle>
          </DialogHeader>
          <AddPluginForm
            onCancel={() => setAddDialogOpen(false)}
            onSuccess={async () => {
              setAddDialogOpen(false);
              setLoading(true);
              const pluginsData = await getAllJavaPlugins();
              setPlugins(cloneDeep(Array.isArray(pluginsData) ? pluginsData : pluginsData?.data ?? []));
              setLoading(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddPluginForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    version: z.string().min(1, "La version est requise"),
    description: z.string().min(1, "La description est requise"),
    jar: z.any().refine((file) => file instanceof File, "Le fichier .jar est requis"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      version: "",
      description: "",
      jar: undefined,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (values: { name: string; version: string; description: string; jar: File }) => {
    setSubmitting(true);
    try {
      await postJavaPlugin(values.name, values.version, values.description, values.jar);
      onSuccess();
    } catch (e) {
      // TODO: afficher une erreur
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fichier .jar</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".jar"
                  onChange={e => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>Annuler</Button>
          <Button type="submit" variant="blue" disabled={submitting}>Ajouter</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function AddJavaVersionForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const formSchema = z.object({
    version: z.string().min(1, "La version est requise"),
    fileName: z.string().min(1, "Le nom du fichier est requis"),
    jar: z.any().refine((file) => file instanceof File, "Le fichier .jar est requis"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: "",
      fileName: "",
      jar: undefined,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (values: { version: string; fileName: string; jar: File }) => {
    setSubmitting(true);
    try {
      await postJavaVersion(values.version, values.fileName, values.jar);
      onSuccess();
    } catch (e) {
      // TODO: afficher une erreur
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du fichier</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fichier .jar</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".jar"
                  onChange={e => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>Annuler</Button>
          <Button type="submit" variant="blue" disabled={submitting}>Ajouter</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditJavaVersionForm({ version, onCancel, onSuccess }: { version: JavaVersionModel, onCancel: () => void, onSuccess: () => void }) {
  const formSchema = z.object({
    version: z.string().min(1, "La version est requise"),
    fileName: z.string().min(1, "Le nom du fichier est requis"),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      version: version.version,
      fileName: version.fileName,
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (values: { version: string; fileName: string }) => {
    setSubmitting(true);
    try {
      await updateJavaVersion(version.id, values);
      onSuccess();
    } catch (e) {
      // TODO: afficher une erreur
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du fichier</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>Annuler</Button>
          <Button type="submit" variant="blue" disabled={submitting}>Enregistrer</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
