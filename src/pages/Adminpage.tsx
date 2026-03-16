import { useState, useEffect, useContext } from "react";
import {
  useDeleteUser,
  useGetAllUser,
  useGetConfig,
  useGetGroupesByUser,
  useUpdateConfig,
} from "../services/membreService";
import type { User } from "../types/User";
import { AuthContext } from "../context/AuthContext";
import { CircleX, TrashIcon } from "lucide-react";

export default function AdminPage() {
  const getConfig = useGetConfig();
  const getAllUser = useGetAllUser();
  const updateConfig = useUpdateConfig();
  const context = useContext(AuthContext);
  const RemoveUser = useDeleteUser();
  const GetGroupesByUser = useGetGroupesByUser();
  

  const [erreur, setErreur] = useState("");
  const [allUser, setAllUser] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<Record<number, { id: number, nom: string }[]>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const [emailAdmin, setEmailAdmin] = useState("");
  const [maxTaches, setMaxTaches] = useState(10);
  const [maxGroupes, setMaxGroupes] = useState(3);
  const [maxNotes, setMaxNotes] = useState(10);
  const [maxMouvements, setMaxMouvements] = useState(10);
  const [maxAchats, setMaxAchats] = useState(10);
  const [maxPrets, setMaxPrets] = useState(10);
  let tabLabel = [
    "taches",
    "groupes",
    "notes",
    "mouvements",
    "achats",
    "prets",
  ];
  let tabFonct = [
    setMaxTaches,
    setMaxGroupes,
    setMaxNotes,
    setMaxMouvements,
    setMaxAchats,
    setMaxPrets,
  ];
  let tabValues = [
    maxTaches,
    maxGroupes,
    maxNotes,
    maxMouvements,
    maxAchats,
    maxPrets,
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
    });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const users = await getAllUser();
        setAllUser(users);

        const groupsMap: Record<number, { id: number, nom: string }[]> = {};
        await Promise.all(
          users.map(async (u: User) => {
            try {
              groupsMap[u.id] = await GetGroupesByUser(u.id);
            } catch {
              groupsMap[u.id] = [];
            }
          })
        );
        setUserGroups(groupsMap);
      } catch (err) {
        setErreur("le groupes ou l'utilisateur n'existe pas");
      }
    };
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
      const [resultatUser] = await Promise.all([
        getAllUser()
      ]);
      setAllUser(resultatUser);
    }

  async function handleRemoveUser(userId: number) {

    await RemoveUser(String(userId));
    await refreshGroupData();
  }

  const filteredUsers = allUser.filter((user: User) => {
    const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <>
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
          placeholder="Rechercher par nom ou prénom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <ul>
          {filteredUsers.map((user: User) => (
            <li key={user.email}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                className="m-5"
              >
                {user.nom} {user.prenom}{" "}
                <button
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <CircleX />
                </button>
                Groupes : {(userGroups[user.id] ?? []).map((g) => g.id).join(", ")}
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
    </>
  );
}
