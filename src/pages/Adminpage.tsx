import { useState, useEffect } from "react";
import {
  useDeleteUser,
  useGetAllUser,
  useGetDateLastCoByUser,
} from "../services/userService";
import {
  useDeleteGroupe,
  useGetAllGroupes,
  useGetGroupesByUser,
} from "../services/groupeService";
import {
  useGetConfig,
  useUpdateConfig,
} from "../services/configService";
import type { User } from "../types/User";
import { CircleX } from "lucide-react";

type Groupe = {
  id: number;
  nom: string;
};

export default function AdminPage() {
  const getConfig = useGetConfig();
  const getAllUser = useGetAllUser();
  const updateConfig = useUpdateConfig();
  const RemoveUser = useDeleteUser();
  const GetGroupesByUser = useGetGroupesByUser();
  const GetDateLastCo = useGetDateLastCoByUser();
  const GetAllGroupes = useGetAllGroupes();
  const RemoveGroupe = useDeleteGroupe();

  const [allUser, setAllUser] = useState<User[]>([]);
  const [allGroupes, setAllGroupes] = useState<Groupe[]>([]);
  const [userGroups, setUserGroups] = useState<Record<number, Groupe[]>>({});
  const [userDates, setUserDates] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermGroupe, setSearchTermGroupe] = useState("");

  const [emailAdmin, setEmailAdmin] = useState("");
  const [maxTaches, setMaxTaches] = useState(10);
  const [maxGroupes, setMaxGroupes] = useState(3);
  const [maxNotes, setMaxNotes] = useState(10);
  const [maxMouvements, setMaxMouvements] = useState(10);
  const [maxAchats, setMaxAchats] = useState(10);
  const [maxPrets, setMaxPrets] = useState(10);
  const [maxConfigurations, setMaxConfigurations] = useState(10);
  const [maxImages, setMaxImages] = useState(10);
  let tabLabel = [
    "taches",
    "groupes",
    "notes",
    "mouvements",
    "achats",
    "prets",
    "configurations",
    "images",
  ];
  let tabFonct = [
    setMaxTaches,
    setMaxGroupes,
    setMaxNotes,
    setMaxMouvements,
    setMaxAchats,
    setMaxPrets,
    setMaxConfigurations,
    setMaxImages,
  ];
  let tabValues = [
    maxTaches,
    maxGroupes,
    maxNotes,
    maxMouvements,
    maxAchats,
    maxPrets,
    maxConfigurations,
    maxImages,
  ];

  useEffect(() => {
    getConfig().then((data) => {
      setEmailAdmin(data.emailAdmin ?? "");
      setMaxTaches(data.maxTaches ?? 0);
      setMaxGroupes(data.maxGroupes ?? 0);
      setMaxNotes(data.maxNotes ?? 0);
      setMaxMouvements(data.maxMouvements ?? 0);
      setMaxAchats(data.maxAchats ?? 0);
      setMaxPrets(data.maxPrets ?? 0);
      setMaxConfigurations(data.maxConfigurations ?? 0);
      setMaxImages(data.maxImages ?? 0);
    });
  }, []);

  const fetchUser = async () => {
    try {
      const users = await getAllUser();
      setAllUser(users);

      const groupes = await GetAllGroupes();
      setAllGroupes(groupes);

      const groupsMap: Record<number, { id: number; nom: string }[]> = {};
      const datesMap: Record<number, string> = {};
      await Promise.all(
        users.map(async (u: User) => {
          try {
            groupsMap[u.id] = await GetGroupesByUser(u.id);
            const dateData = await GetDateLastCo(u.id);
            datesMap[u.id] = dateData?.lastco ?? "";
          } catch {
            groupsMap[u.id] = [];
            datesMap[u.id] = "";
          }
        }),
      );
      setUserGroups(groupsMap);
      setUserDates(datesMap);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs/groupes", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSauvegarder = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      await updateConfig(
        emailAdmin,
        maxTaches,
        maxGroupes,
        maxNotes,
        maxMouvements,
        maxAchats,
        maxPrets,
        maxConfigurations,
        maxImages,
      );
      alert("Configuration mise à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  async function refreshGroupData() {
    const [resultatUser, resultatGroupes] = await Promise.all([
      getAllUser(),
      GetAllGroupes(),
    ]);
    setAllUser(resultatUser);
    setAllGroupes(resultatGroupes);
    fetchUser();
  }

  async function handleRemoveUser(userId: number) {
    await RemoveUser(String(userId));
    await refreshGroupData();
  }

  async function handleRemoveGroupe(groupeId: number) {
    await RemoveGroupe(String(groupeId));
    await refreshGroupData();
  }

  const filteredUsers = allUser.filter((user: User) => {
    const fullName = `${user.nom} ${user.prenom} ${user.id}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const filteredGroupes = allGroupes.filter((groupe: Groupe) => {
    const fullName = `${groupe.nom} ${groupe.id}`.toLowerCase();
    return fullName.includes(searchTermGroupe.toLowerCase());
  });

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Panneau d'Administration</h1>

          <form
            onSubmit={handleSauvegarder}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email de l'Administrateur
              </label>
              <input
                type="email"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-lg"
              />
            </div>

            {tabValues.map((value, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {"Nombre max de " + tabLabel[index]}
                </label>
                <input
                  type="number"
                  value={value ?? 0}
                  onChange={(e) => tabFonct[index](Number(e.target.value))}
                  className="w-full border border-slate-200 p-2 rounded-lg"
                />
              </div>
            ))}
            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Sauvegarder les modifications
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-200 p-2 rounded-lg w-full mb-4"
          />
          <ul className="space-y-2">
            {filteredUsers.map((user) => (
              <li key={user.email}>
                <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700">
                  {user.nom} {user.prenom} : id = {user.id}
                  <button onClick={() => handleRemoveUser(user.id)} className="text-red-500 hover:text-red-600">
                    <CircleX size={18} />
                  </button>
                  <span className="text-slate-500">Groupes =</span>
                  {(userGroups[user.id] ?? []).map((g) => g.id).join(", ")}, co
                  = {userDates[user.id] ?? ""}
                </div>
              </li>
            ))}

            {filteredUsers.length === 0 && (
              <li className="text-slate-500 italic p-2">
                Aucun utilisateur trouvé pour "{searchTerm}".
              </li>
            )}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <input
            type="text"
            placeholder="Rechercher par nom ou id..."
            value={searchTermGroupe}
            onChange={(e) => setSearchTermGroupe(e.target.value)}
            className="border border-slate-200 p-2 rounded-lg w-full mb-4"
          />
          <ul className="space-y-2">
            {filteredGroupes.map((group) => (
              <li key={group.id}>
                <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-700">
                  {group.nom}
                  {" : id = "}
                  {group.id}
                  {" Membres = "}
                  {Object.entries(userGroups)
                    .filter(([, groups]) =>
                      groups.some((g) => g.id === group.id),
                    )
                    .map(([userId]) => userId)
                    .join(", ")}
                  <button onClick={() => handleRemoveGroupe(group.id)} className="text-red-500 hover:text-red-600">
                    <CircleX size={18} />
                  </button>
                </div>
              </li>
            ))}

            {filteredGroupes.length === 0 && (
              <li className="text-slate-500 italic p-2">
                Aucun groupe trouvé pour "{searchTermGroupe}".
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
