import { useState } from "react";
import {
  UserCog,
  Users,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Image,
  ArrowLeftRight,
  StickyNote,
  BookOpen,
  CheckSquare,
  KeyRound,
  Trash2,
  UserPlus,
  LogOut,
  ShieldAlert,
  Settings2,
  ChevronsUp,
  Star,
  ChevronsDown,
  SlidersHorizontal,
  CircleX,
  Shield,
  Sliders,
  User,
} from "lucide-react";


type StepProps = { number: number; text: React.ReactNode };
type AccordionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};
type WidgetCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips?: string[];
  color: string;
};

function Step({ number, text }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
        {number}
      </span>
      <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Accordion({ title, icon, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 font-semibold text-slate-800">
          {icon}
          {title}
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-white border-t border-slate-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm leading-relaxed">
      <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function WidgetCard({ icon, title, description, tips, color }: WidgetCardProps) {
  return (
    <div className={`rounded-2xl border ${color} p-5 space-y-3`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/70">{icon}</div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      {tips && tips.length > 0 && (
        <ul className="space-y-1">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-500 text-xs">
              <span className="mt-0.5 text-blue-400">•</span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Tutoriel</h1>
          </div>
          <p className="text-slate-500 text-base max-w-2xl">
            Bienvenue ! Retrouvez ici toutes les explications pour utiliser
            l'application : gestion de votre compte, de votre groupe et
            utilisation des widgets du tableau de bord.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Utilisateur</h2>
            <span className="text-sm text-slate-400">— Gestion du compte</span>
          </div>

          <div className="space-y-3">
            <Accordion
              title="Modifier mes informations"
              icon={<UserCog className="w-5 h-5 text-blue-500" />}
            >
              <p className="text-slate-500 text-sm">
                Accédez à{" "}
                <strong className="text-slate-700">Mon profil</strong> depuis
                l'icône en haut à droite de la barre de navigation.
              </p>
              <SubSection title="Étapes">
                <Step number={1} text="Cliquez sur l'icône Mon profil (⚙) dans la barre de navigation." />
                <Step number={2} text="Modifiez votre adresse e-mail, prénom ou nom dans les champs correspondants." />
                <Step number={3} text="Cliquez sur « Changer » pour enregistrer les modifications." />
              </SubSection>
            </Accordion>

            <Accordion
              title="Changer mon mot de passe"
              icon={<KeyRound className="w-5 h-5 text-indigo-500" />}
            >
              <p className="text-slate-500 text-sm">
                Le champ <em>Mot de passe</em> sur la page Mon profil vous
                permet de définir un nouveau mot de passe. Laissez-le vide si
                vous ne souhaitez pas le modifier.
              </p>
              <SubSection title="Étapes">
                <Step number={1} text="Rendez-vous sur la page Mon profil." />
                <Step number={2} text="Saisissez votre nouveau mot de passe dans le champ prévu à cet effet." />
                <Step number={3} text="Cliquez sur « Changer » — votre mot de passe est immédiatement mis à jour." />
              </SubSection>
              <InfoBox>
                Pour des raisons de sécurité, choisissez un mot de passe d'au
                moins 8 caractères mêlant lettres et chiffres.
              </InfoBox>
            </Accordion>

            <Accordion
              title="Supprimer mon compte"
              icon={<Trash2 className="w-5 h-5 text-red-500" />}
            >
              <p className="text-slate-500 text-sm">
                La suppression de votre compte est définitive et entraîne votre
                déconnexion immédiate.
              </p>
              <SubSection title="Étapes">
                <Step number={1} text="Ouvrez la page Mon profil." />
                <Step number={2} text="Cliquez sur le bouton rouge « Supprimer le compte »." />
                <Step number={3} text="Confirmez la suppression dans la fenêtre de confirmation." />
              </SubSection>
              <InfoBox>
                Cette action est irréversible. Toutes vos données personnelles
                seront supprimées.
              </InfoBox>
            </Accordion>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Groupe</h2>
            <span className="text-sm text-slate-400">
              — Membres, urgence &amp; configuration
            </span>
          </div>

          <div className="space-y-3">
            <Accordion
              title="Gérer les membres"
              icon={<Users className="w-5 h-5 text-emerald-500" />}
            >
              <p className="text-slate-500 text-sm">
                En tant qu'<strong className="text-slate-700">administrateur</strong>{" "}
                du groupe, vous pouvez ajouter, promouvoir ou retirer des
                membres depuis la page{" "}
                <strong className="text-slate-700">Gestion du groupe</strong>.
              </p>

              <SubSection title="Rôles disponibles">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-amber-700 mb-1">
                      <Star className="w-4 h-4" /> Administrateur
                    </div>
                    <p className="text-amber-600 text-xs">
                      Gère les membres et la configuration du groupe.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-blue-700 mb-1">
                      <Users className="w-4 h-4" /> Membre
                    </div>
                    <p className="text-blue-600 text-xs">
                      Accès complet aux widgets et données du groupe.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-600 mb-1">
                      <UserPlus className="w-4 h-4" /> Invité
                    </div>
                    <p className="text-slate-500 text-xs">
                      Accès limité en lecture seule.
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Ajouter un membre">
                <Step number={1} text={<>Cliquez sur le bouton « <UserPlus className="inline w-4 h-4 align-text-bottom" /> » en bas de la liste des membres.</>} />
                <Step number={2} text={<>Recherchez l'utilisateur par nom, prénom ou identifiant.</>} /> 
                <Step number={3} text={<>Cliquez sur « + » à côté de son nom pour l'ajouter au groupe.</>} />
              </SubSection>

              <SubSection title="Changer le rôle d'un membre">
                <Step number={1} text={<>Dans la liste des membres, repérez les icônes de flèches à côté du nom.</>} />
                <Step
                  number={2}
                  text={<><ChevronsUp className="inline w-4 h-4 align-text-bottom" /> : promouvoir en administrateur · <ChevronUp className="inline w-4 h-4 align-text-bottom" /> : promouvoir Invité → Membre.</>}
                />
                <Step
                  number={3}
                  text={<><ChevronsDown className="inline w-4 h-4 align-text-bottom" /> : rétrograder un admin · <ChevronDown className="inline w-4 h-4 align-text-bottom" /> : rétrograder Membre → Invité.</>}
                />
              </SubSection>

              <SubSection title="Retirer un membre">
                <Step number={1} text={<>Cliquez sur l'icône <LogOut className="inline w-4 h-4 align-text-bottom" /> à droite du membre concerné.</>} />
                <Step number={2} text={<>Le membre est immédiatement retiré et ses droits supprimés.</>} />
              </SubSection>
            </Accordion>

            <Accordion
              title="Procédure d'urgence"
              icon={<Settings2 className="w-5 h-5 text-violet-500" />}
            >
              <p className="text-slate-500 text-sm">
                Si un groupe se retrouve <strong className="text-slate-700">sans administrateur
                </strong> (ex. : l'admin a quitté ou supprimé son compte), une
                procédure d'urgence est activée automatiquement.
              </p>
              <SubSection title="Comment ça fonctionne">
                <Step
                  number={1}
                  text={<>L'application détecte l'absence d'administrateur et affiche le groupe en mode urgence. Donne à tous les membres le droit de promouvoir un membre en administrateur.</>}
                />
                <Step
                  number={2}
                  text={<>N'importe quel membre ou invité du groupe voit apparaître le bouton <ChevronsUp className="inline w-4 h-4 align-text-bottom" /> à côté des membres.</>}
                />
                <Step
                  number={3}
                  text={<>En cliquant dessus, ce membre est automatiquement promu administrateur.</>}
                />
                <Step
                  number={4}
                  text={<>Le groupe retrouve un administrateur et le fonctionnement normal reprend.</>}
                />
              </SubSection>
              <InfoBox>
                Cette procédure est conçue pour éviter qu'un groupe reste sans
                gestionnaire. Agissez rapidement pour rétablir la gouvernance.
              </InfoBox>
              <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <ChevronsUp className="w-4 h-4 flex-shrink-0" />
                <span>
                  L'icône <ChevronsUp className="inline w-4 h-4 align-text-bottom" /> visible en mode urgence permet à
                  tout membre de s'auto-promouvoir administrateur.
                </span>
              </div>
            </Accordion>

            <Accordion
              title="Configuration des tableaux de bord"
              icon={<SlidersHorizontal className="w-5 h-5 text-violet-500" />}
            >
              <p className="text-slate-500 text-sm">
                Chaque membre dispose de sa <strong className="text-slate-700">propre configuration</strong> du
                tableau de bord, indépendante des autres membres du groupe. Vous
                pouvez choisir quels widgets afficher et ajuster leur taille
                selon vos besoins.
              </p>

              <SubSection title="Personnaliser ses widgets">
                <Step number={1} text={<>Rendez-vous sur votre tableau de bord via "Mon tableau de bord" dans la barre de navigation.</>} />
                <Step number={2} text={<>Cliquez sur le bouton "+" (en bas de la page) pour ajouter une configuration.</>} />
                <Step number={3} text={<>Ajouter les widgets souhaités et régler leurs tailles.</>} />
                <Step number={4} text={<>Vos préférences sont sauvegardées automatiquement et s'appliquent uniquement à votre vue.</>} />
              </SubSection>

              <InfoBox>
                La configuration du tableau de bord est <strong>personnelle</strong> : chaque membre
                voit les widgets qu'il a choisi d'afficher, sans affecter les autres membres du groupe.
              </InfoBox>
            </Accordion>

            <Accordion
              title="Quitter un groupe"
              icon={<LogOut className="w-5 h-5 text-slate-500" />}
            >
              <p className="text-slate-500 text-sm">
                Vous pouvez quitter un groupe à tout moment depuis votre
                tableau de bord.
              </p>
              <SubSection title="Étapes">
                <Step number={1} text={<>Ouvrez le sélecteur de groupe en haut du tableau de bord.</>} />
                <Step number={2} text={<>Cliquez sur « Quitter le groupe » sur le groupe souhaité.</>} />
                <Step number={3} text={<>Confirmez. Si vous êtes le dernier administrateur, nommez d'abord un successeur.</>} />
              </SubSection>
            </Accordion>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="w-6 h-6 text-violet-600" />
            <h2 className="text-xl font-bold text-slate-800">Widgets</h2>
            <span className="text-sm text-slate-400">
              — Utilisation de chacun
            </span>
          </div>

          <p className="text-slate-500 text-sm mb-6">
            Les widgets sont les blocs fonctionnels de votre tableau de bord.
            Certains sont <strong className="text-slate-700">partagés avec tous les membres</strong> du
            groupe (Tâches, Achats, Prêts, Mouvements), d'autres sont{" "}
            <strong className="text-slate-700">personnels</strong> et visibles uniquement par vous
            (Notes, Image).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WidgetCard
              icon={<CheckSquare className="w-5 h-5 text-blue-600" />}
              title="Tâches"
              color="border-blue-200 bg-blue-50/50"
              description="Gérez les tâches à accomplir au sein du groupe. Créez, assignez et marquez des tâches comme terminées."
              tips={[
                "Ajoutez une tâche via le bouton « + ».",
                "Assignez une date de début et de fin.",
                "Assignez des membres responsables.",
                "Marquez une tâche terminée en modifiant son statut.",
                "Supprimez une tâche avec l'icône de croix.",
              ]}
            />

            <WidgetCard
              icon={<StickyNote className="w-5 h-5 text-amber-600" />}
              title="Notes"
              color="border-amber-200 bg-amber-50/50"
              description="Prenez des notes personnelles visibles uniquement par vous. Idéal pour retenir des informations, des rappels ou des idées."
              tips={[
                "Ajoutez une note via le bouton « + ».",
                "Modifiez une note en cliquant sur son titre ou contenu.",
                "Supprimez une note avec l'icône de croix.",
                "Vos notes ne sont pas visibles par les autres membres du groupe.",
                "Les notes sont indépendantes des groupes donc disponibles dans tous les groupes."
              ]}
            />

            <WidgetCard
              icon={<ShoppingCart className="w-5 h-5 text-emerald-600" />}
              title="Achats"
              color="border-emerald-200 bg-emerald-50/50"
              description="Suivez les achats réalisés ou à prévoir pour le groupe. Associez un montant et un demandeur à chaque achat."
              tips={[
                "Ajoutez un achat avec le bouton « + ».",
                "Renseignez le montant, la description et la date.",
                "Modifier le statut d'un achat pour l'indiquer comme effectué.",
                "Supprimez un achat via l'icône de croix.",
              ]}
            />

            <WidgetCard
              icon={<BookOpen className="w-5 h-5 text-violet-600" />}
              title="Prêts"
              color="border-violet-200 bg-violet-50/50"
              description="Enregistrez les prêts d'objets. Gardez une trace de qui a prêté quoi."
              tips={[
                "Créez un prêt en indiquant l'objet et l'emprunteur.",
                "Indiquez la date de début et de fin prévue du prêt.",
                "Marquez un prêt comme rendu en modifiant son statut.",
                "Supprimez un prêt via l'icône de croix.",
              ]}
            />

            <WidgetCard
              icon={<ArrowLeftRight className="w-5 h-5 text-cyan-600" />}
              title="Mouvements"
              color="border-cyan-200 bg-cyan-50/50"
              description="Suivez les mouvements du personnel : prises de poste, départs, stages, mutations, etc. Gardez un historique clair de chaque changement de situation."
              tips={[
                "Ajoutez un mouvement avec le bouton « + ».",
                "Précisez le type de mouvement (Stage, Départ, Prend son poste, Mutation…).",
                "Indiquez la date et, si besoin, un commentaire ou une description.",
                "Consultez l'historique complet de tous les mouvements dans la liste.",
                "Supprimez un mouvement via l'icône de croix.",
              ]}
            />

            <WidgetCard
              icon={<Image className="w-5 h-5 text-pink-600" />}
              title="Image"
              color="border-pink-200 bg-pink-50/50"
              description="Widget décoratif personnel pour afficher une image de votre choix sur votre tableau de bord : photo de proches, schéma, mémo visuel…"
              tips={[
                "Cliquez sur le widget pour choisir une image depuis votre appareil.",
                "L'image n'est visible que par vous, pas par les autres membres.",
                "Vous pouvez changer ou supprimer l'image à tout moment.",
                "Supprimez l'image via l'icône de croix.",
              ]}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-800">Administrateur</h2>
            <span className="text-sm text-slate-400">— Panneau d'administration global</span>
          </div>

          <p className="text-slate-500 text-sm mb-6">
            La page <strong className="text-slate-700">Administrateur</strong> est réservée au
            super-administrateur de l'application. Elle permet de gérer la
            configuration globale, les comptes utilisateurs et les groupes.
          </p>

          <div className="space-y-3">
            <Accordion
              title="Configuration globale"
              icon={<Sliders className="w-5 h-5 text-red-500" />}
            >
              <p className="text-slate-500 text-sm">
                Définissez les limites maximales autorisées pour chaque type de
                données dans l'application, ainsi que l'adresse e-mail de
                contact de l'administrateur.
              </p>
              <SubSection title="Paramètres configurables">
                <Step number={1} text={<>Modifiez l'<strong>e-mail de l'administrateur</strong> (adresse de contact affichée dans l'application).</>} />
                <Step
                  number={2}
                  text={<>Ajustez le <strong>nombre maximum</strong> par utilisateur ou groupe pour chaque type : tâches, groupes, notes, mouvements, achats, prêts, configurations et images.</>}
                />
                <Step number={3} text={<>Cliquez sur <strong>« Sauvegarder les modifications »</strong> pour appliquer les changements.</>} />
              </SubSection>
              <InfoBox>
                Ces limites s'appliquent à l'ensemble de l'application. Toute
                modification est immédiatement effective pour tous les
                utilisateurs.
              </InfoBox>
            </Accordion>

            <Accordion
              title="Gestion des utilisateurs"
              icon={<User className="w-5 h-5 text-red-500" />}
            >
              <p className="text-slate-500 text-sm">
                Consultez la liste complète des comptes inscrits sur
                l'application. Vous pouvez rechercher un utilisateur et
                supprimer son compte si nécessaire.
              </p>
              <SubSection title="Informations affichées">
                <Step number={1} text="Nom, prénom et identifiant (id) de chaque utilisateur." />
                <Step number={2} text="Liste des groupes auxquels l'utilisateur appartient." />
                <Step number={3} text="Date de dernière connexion de l'utilisateur." />
              </SubSection>
              <SubSection title="Supprimer un utilisateur">
                <Step number={1} text="Recherchez l'utilisateur via la barre de recherche (nom, prénom ou id)." />
                <Step
                  number={2}
                  text={<>Cliquez sur l'icône <CircleX className="inline w-4 h-4 align-text-bottom text-red-500" /> à côté de son nom pour supprimer son compte.</>}
                />
              </SubSection>
              <InfoBox>
                La suppression d'un compte est définitive. L'utilisateur est
                retiré de tous ses groupes et toutes ses données personnelles
                sont effacées.
              </InfoBox>
            </Accordion>

            <Accordion
              title="Gestion des groupes"
              icon={<Users className="w-5 h-5 text-red-500" />}
            >
              <p className="text-slate-500 text-sm">
                Consultez tous les groupes créés sur l'application. Vous pouvez
                rechercher un groupe par nom ou identifiant et le supprimer.
              </p>
              <SubSection title="Informations affichées">
                <Step number={1} text="Nom et identifiant (id) du groupe." />
                <Step number={2} text="Liste des identifiants des membres appartenant au groupe." />
              </SubSection>
              <SubSection title="Supprimer un groupe">
                <Step number={1} text="Recherchez le groupe via la barre de recherche (nom ou id)." />
                <Step
                  number={2}
                  text={<>Cliquez sur l'icône <CircleX className="inline w-4 h-4 align-text-bottom text-red-500" /> à côté du groupe pour le supprimer définitivement.</>}
                />
              </SubSection>
              <InfoBox>
                La suppression d'un groupe est irréversible. Tous les membres
                en sont retirés et toutes les données du groupe (tâches,
                achats, prêts, mouvements…) sont effacées.
              </InfoBox>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
