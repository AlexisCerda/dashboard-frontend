import { useState, useEffect, useContext } from "react";
import {
  useDeleteGroupe,
  useDeleteUser,
  useGetAllGroupes,
  useGetAllUser,
  useGetConfig,
  useGetDateLastCoByUser,
  useGetGroupesByUser,
  useUpdateConfig,
} from "../services/membreService";
import type { User } from "../types/User";
import { AuthContext } from "../context/AuthContext";
import { CircleX, TrashIcon } from "lucide-react";

type Groupe = {
  id: number;
  nom: string;
};

export default function AdminPage() {
  const getConfig = useGetConfig();
  const getAllUser = useGetAllUser();
  const updateConfig = useUpdateConfig();
  const context = useContext(AuthContext);
  const RemoveUser = useDeleteUser();
  const GetGroupesByUser = useGetGroupesByUser();
  const GetDateLastCo = useGetDateLastCoByUser();
  const GetAllGroupes = useGetAllGroupes();
  const RemoveGroupe = useDeleteGroupe();

  const [erreur, setErreur] = useState("");
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
      setEmailAdmin(data.emailAdmin);
      setMaxTaches(data.maxTaches);
      setMaxGroupes(data.maxGroupes);
      setMaxNotes(data.maxNotes);
      setMaxMouvements(data.maxMouvements);
      setMaxAchats(data.maxAchats);
      setMaxPrets(data.maxPrets);
      setMaxConfigurations(data.maxConfigurations);
      setMaxImages(data.maxImages);
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
      setErreur("le groupes ou l'utilisateur n'existe pas");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSauvegarder = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const nouvelleConfig = { emailAdmin, maxTaches, maxGroupes };

    try {
      await updateConfig(
        emailAdmin,
        maxTaches,
        maxGroupes,
        maxNotes,
        maxMouvements,
        maxAchats,
        maxPrets,
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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Panneau d'Administration </h1>

          <form
            onSubmit={handleSauvegarder}
            className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de l'Administrateur
              </label>
              <input
                type="email"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {tabValues.map((value, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {"Nombre max de " + tabLabel[index]}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => tabFonct[index](Number(e.target.value))}
                  className="w-full border p-2 rounded"
                />
              </div>
            ))}
            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sauvegarder les modifications
            </button>
          </form>
        </div>
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <ul>
            {filteredUsers.map((user) => (
              <li key={user.email}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  className="m-5"
                >
                  {user.nom} {user.prenom} : id = {user.id}{" "}
                  <button onClick={() => handleRemoveUser(user.id)}>
                    <CircleX />
                  </button>
                  Groupes ={" "}
                  {(userGroups[user.id] ?? []).map((g) => g.id).join(", ")}, co
                  = {userDates[user.id] ?? ""}
                </div>
              </li>
            ))}

            {filteredUsers.length === 0 && (
              <li className="text-gray-500 m-5 italic">
                Aucun utilisateur trouvé pour "{searchTerm}".
              </li>
            )}
          </ul>
        </div>
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou id..."
            value={searchTermGroupe}
            onChange={(e) => setSearchTermGroupe(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <ul>
            {filteredGroupes.map((group) => (
              <li key={group.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                  className="m-5"
                >
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
                  <button onClick={() => handleRemoveGroupe(group.id)}>
                    <CircleX />
                  </button>
                </div>
              </li>
            ))}

            {filteredGroupes.length === 0 && (
              <li className="text-gray-500 m-5 italic">
                Aucun groupe trouvé pour "{searchTermGroupe}".
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
