import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Glasses,
  TriangleAlert,
  PackageCheck,
  Coins,
  Camera,
  ArrowLeftRight,
  MapPin,
  ShoppingBag,
  Users,
  History,
  Settings,
  ReceiptText,
  TrendingUp,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import * as db from "./lib/db";
import { downloadPayslipPdf } from "./lib/payslipPdf";

const CATEGORIES = ["Photochromique", "Blue Protect", "Solaire", "Autre"];
const VILLES = ["Yaoundé", "Douala"];

const emptyItemForm = {
  reference: "",
  nom: "",
  categorie: CATEGORIES[0],
  couleur: "",
  quantite: "",
  prixAchat: "",
  prixVente: "",
  seuil: "3",
  photo: "",
};

const LIVRAISON_OPTIONS = [1000, 1500, 2000, 2500];
const EXPEDITION_OPTIONS = [1500, 2000, 2500, 3000];

const QUARTIERS_YAOUNDE = [
  ["Centre-ville", 1000], ["Poste centrale", 1000], ["Etoa-Meki", 1000], ["Nlongkak", 1000],
  ["Elig-Essono", 1000], ["Bastos", 1000], ["Manguier", 1000], ["Mvog-Ada", 1000], ["Essom", 1000],
  ["Mfoundi", 1000], ["Ministère", 1000], ["Hotel de ville", 1000], ["Mvan", 1000], ["Elig-edzoa", 1000],
  ["Warda", 1000], ["Mvog-bi", 1000],
  ["Mokolo", 1500], ["Cité Verte", 1500], ["Madagascar", 1500], ["Ngousso", 1500], ["Tsinga", 1500],
  ["Melen", 1500], ["Elig-Effa", 1500], ["Obili", 1500], ["Essos", 1500], ["Nkol-Messeng", 1500],
  ["Nsimeyong", 1500], ["Ngoa-Ekele", 1500], ["Etoudi", 1500], ["Messassi", 1500], ["Emana", 1500],
  ["Dakar", 1500], ["Olezoa", 1500], ["Biyem-Assi", 1500], ["Ekoundoum", 1500], ["Awae", 1500],
  ["Grand Messa", 1500], ["Simbock", 1500], ["Efoulan", 1500], ["Kondengui", 1500], ["Tongolo", 1500],
  ["Nkolbisson", 2000], ["Oyomabang", 2000], ["Biyemassi", 2000], ["Odza", 2000], ["Nkoabang", 2000],
  ["Ahala", 2000], ["Nkozoa", 2000], ["Olembe", 2000], ["Mbankolo", 2000], ["Etoug-Ebe", 2000],
  ["Nkolbikok", 2000], ["Afanoya", 2000], ["Soa Centre", 2000],
  ["Mfou centre", 2500], ["Nkometou", 2500], ["Nomayos", 2500], ["Akak", 2500], ["Minkoameyos", 2500],
  ["Nkolso", 2500], ["Nsimalen", 2500], ["Nkomo", 2500], ["Ebang", 2500],
];
// Liste de Douala à venir — quartier saisi librement en attendant.
const QUARTIERS_DOUALA = [
  ["Bependa", 1000], ["Logpom", 1000], ["Cité des palmiers", 1000], ["Akwa Nord", 1000], ["Cité Sic", 1000],
  ["Deido", 1000], ["Ange Raphael", 1000], ["Akwa", 1000], ["Ndokoti", 1000], ["Mboppi", 1000],
  ["Bessengue", 1000], ["Bali", 1000], ["Kotto", 1000], ["Logbessou", 1000], ["Makepe", 1000],
  ["Beedi", 1000], ["Bonamoussadi", 1000], ["Ndogbong", 1000], ["Terminus Sadi", 1000], ["Ndogsimbi", 1000],
  ["Bonakouamouang", 1000], ["Malangue", 1000], ["Bp cité", 1000], ["Bonabo", 1000],
  ["Koumassi", 1500], ["Terminus Saint Michel", 1500], ["Logbaba", 1500], ["Japoma", 1500],
  ["Bonaberi centre ville", 1500], ["Bonapriso", 1500], ["Bonanjo", 1500], ["Dernier poteau", 1500],
  ["Nkouleuloun", 1500], ["Marché Central", 1500], ["Yassa", 1500], ["Nyalla", 1500], ["Dakar", 1500],
  ["Brazaville", 1500], ["PK8 à PK15", 1500], ["Tergal", 1500], ["Kotto Village", 1500], ["Newbell", 1500],
  ["Bonamouti", 1500], ["Génie Militaire", 1500], ["Total Nkolbong", 1500], ["Kilomètre 5", 1500],
  ["B'ssadi village", 1500],
  ["PK16 à PK17", 2000], ["Bwang Bakoko", 2000], ["Japoma Rail", 2000], ["Stade Japoma", 2000],
  ["Sodikombo", 2000], ["Bois des Singes", 2000], ["Carrefour Muzik", 2000], ["Yatchika", 2000],
  ["Ndobo", 2000], ["Messapresse", 2000], ["Youpwe", 2000], ["Village Boko", 2000],
  ["Carrefour Bamboutos", 2000], ["Lendi", 2000], ["Nyalla Kambo", 2000], ["Lindi", 2000],
  ["Carrefour washinton", 2000], ["Carrefour Matango", 2000], ["Cité Chirac", 2000], ["Village", 2000],
  ["Borne 10", 2000], ["Aeroport", 2000], ["Bakoko/Ngwele", 2000],
  ["Bekoko", 2500], ["Bojongo", 2500], ["Yamoussouki", 2500], ["Village Asecna", 2500],
  ["Bonendale", 2500], ["Dibamba avant pont", 2500], ["Village bansoua", 2500],
  ["Boadibo", 3000], ["Bamenga", 3000], ["Supermont", 3000], ["Dibamba après pont", 3000],
];
const QUARTIERS_PAR_VILLE = { "Yaoundé": QUARTIERS_YAOUNDE, "Douala": QUARTIERS_DOUALA };

function todayISODate() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0, 10);
}
const emptyLigne = { itemId: "", quantite: "1", prixVente: "" };
const emptySaleForm = {
  ville: VILLES[0],
  commercialId: "",
  date: "",
  mode: "livraison",
  quartier: "",
  livraison: 1000,
  expedition: 1500,
  lignes: [{ ...emptyLigne }],
};
const emptyCommercialForm = { nom: "", commission: "3050" };

function fmtFCFA(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n || 0)) + " FCFA";
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso) {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Redimensionne une photo côté client avant l'envoi vers Supabase Storage (fichier plus léger, upload plus rapide).
function resizeImageToBlob(file, maxDim = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Échec de conversion de l'image"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function StockApp() {
  const [tab, setTab] = useState("stock");
  const [items, setItems] = useState(null);
  const [commerciaux, setCommerciaux] = useState(null);
  const [ventes, setVentes] = useState(null);
  const [mouvements, setMouvements] = useState(null);
  const [parametres, setParametres] = useState(null);
  const [echecs, setEchecs] = useState(null);
  const [quartiersPerso, setQuartiersPerso] = useState([]);
  const [saveError, setSaveError] = useState("");

  const [ville, setVille] = useState(VILLES[0]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState(emptySaleForm);
  const [saleError, setSaleError] = useState("");
  const [editingVente, setEditingVente] = useState(null);
  const [editVenteForm, setEditVenteForm] = useState({ quantite: "1", date: "" });
  const [editVenteError, setEditVenteError] = useState("");
  const [confirmDeleteVenteId, setConfirmDeleteVenteId] = useState(null);
  const [venteQuery, setVenteQuery] = useState("");

  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [commercialForm, setCommercialForm] = useState(emptyCommercialForm);
  const [confirmDeleteCommId, setConfirmDeleteCommId] = useState(null);

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const [paramsForm, setParamsForm] = useState({ boitier: "500", commission: "3050" });

  const [payslipFor, setPayslipFor] = useState(null);
  const [payslipPeriod, setPayslipPeriod] = useState("month");
  const [payslipCustomFrom, setPayslipCustomFrom] = useState("");
  const [payslipCustomTo, setPayslipCustomTo] = useState("");
  const [payslipBoost, setPayslipBoost] = useState("0");
  const [statsFor, setStatsFor] = useState(null);

  const [bilanPeriod, setBilanPeriod] = useState("month");
  const [bilanCustomFrom, setBilanCustomFrom] = useState("");
  const [bilanCustomTo, setBilanCustomTo] = useState("");
  const [bilanOpen, setBilanOpen] = useState(false);

  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [i, c, v, m, p, ec, qp] = await Promise.all([
          db.fetchItems(),
          db.fetchCommerciaux(),
          db.fetchVentes(),
          db.fetchMouvements(),
          db.fetchParametres(),
          db.fetchEchecs(),
          db.fetchQuartiersPersonnalises(),
        ]);
        setItems(i);
        setCommerciaux(c);
        setVentes(v);
        setMouvements(m);
        setParametres(p);
        setEchecs(ec);
        setQuartiersPerso(qp);
        setParamsForm({ boitier: String(p.boitier), commission: String(p.commission) });
      } catch (e) {
        setLoadError(e.message || "Erreur de chargement");
      }
    })();
  }, []);

  const logMouvement = async (type, detail, mvVille) => {
    try {
      await db.createMouvement({ type, detail, ville: mvVille || "" });
      setMouvements((cur) => [
        { id: crypto.randomUUID(), date: new Date().toISOString(), type, detail, ville: mvVille || "" },
        ...cur,
      ]);
    } catch {
      // Le mouvement est secondaire (journal) : une erreur ici n'empêche pas l'action principale.
    }
  };

  // ---------- Stock ----------
  const openAddItem = () => {
    setItemForm(emptyItemForm);
    setEditingId(null);
    setItemModalOpen(true);
  };
  const openEditItem = (item) => {
    setItemForm({
      reference: item.reference,
      nom: item.nom,
      categorie: item.categorie,
      couleur: item.couleur,
      quantite: String(item.quantite),
      prixAchat: String(item.prixAchat),
      prixVente: String(item.prixVente),
      seuil: String(item.seuil),
      photo: item.photo || "",
    });
    setEditingId(item.id);
    setItemModalOpen(true);
  };
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const blob = await resizeImageToBlob(file);
      const url = await db.uploadPhoto(new File([blob], file.name, { type: "image/jpeg" }));
      setItemForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      setSaveError(err.message || "Échec de l'envoi de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const submitItemForm = async (e) => {
    e.preventDefault();
    if (!itemForm.nom.trim()) return;
    const isNew = !editingId;
    const payload = {
      ville: editingId ? items.find((i) => i.id === editingId).ville : ville,
      reference: itemForm.reference.trim(),
      nom: itemForm.nom.trim(),
      categorie: itemForm.categorie,
      couleur: itemForm.couleur.trim(),
      quantite: Number(itemForm.quantite) || 0,
      prixAchat: Number(itemForm.prixAchat) || 0,
      prixVente: Number(itemForm.prixVente) || 0,
      seuil: Number(itemForm.seuil) || 0,
      photo: itemForm.photo,
    };
    try {
      if (isNew) {
        const created = await db.createItem(payload);
        setItems((cur) => [created, ...cur]);
      } else {
        const updated = await db.updateItem(editingId, payload);
        setItems((cur) => cur.map((it) => (it.id === editingId ? updated : it)));
      }
      logMouvement(
        isNew ? "ajout" : "modification",
        `${isNew ? "Article ajouté" : "Article modifié"} : ${payload.nom} (qté ${payload.quantite})`,
        payload.ville
      );
      setItemModalOpen(false);
    } catch (err) {
      setSaveError(err.message || "Échec de l'enregistrement de l'article.");
    }
  };
  const removeItem = async (id) => {
    const item = items.find((i) => i.id === id);
    try {
      await db.deleteItem(id);
      setItems((cur) => cur.filter((it) => it.id !== id));
      if (item) logMouvement("suppression", `Article supprimé : ${item.nom}`, item.ville);
    } catch (err) {
      setSaveError(err.message || "Échec de la suppression.");
    }
    setConfirmDeleteId(null);
  };
  const doTransfer = async (id) => {
    const item = items.find((i) => i.id === id);
    const dest = item.ville === "Yaoundé" ? "Douala" : "Yaoundé";
    try {
      const updated = await db.updateItem(id, { ...item, ville: dest });
      setItems((cur) => cur.map((it) => (it.id === id ? updated : it)));
      logMouvement("transfert", `${item.nom} transféré de ${item.ville} vers ${dest}`, dest);
    } catch (err) {
      setSaveError(err.message || "Échec du transfert.");
    }
    setTransferItem(null);
  };

  const villeItems = useMemo(() => (items || []).filter((it) => it.ville === ville), [items, ville]);
  const filtered = useMemo(() => {
    return villeItems.filter((it) => {
      const mq =
        !query ||
        it.nom.toLowerCase().includes(query.toLowerCase()) ||
        it.reference.toLowerCase().includes(query.toLowerCase()) ||
        it.couleur.toLowerCase().includes(query.toLowerCase());
      const mc = categoryFilter === "Toutes" || it.categorie === categoryFilter;
      return mq && mc;
    });
  }, [villeItems, query, categoryFilter]);
  const stockStats = useMemo(() => {
    return villeItems.reduce(
      (a, it) => ({
        refs: a.refs + 1,
        unites: a.unites + it.quantite,
        valeur: a.valeur + it.quantite * it.prixVente,
        alertes: a.alertes + (it.quantite <= it.seuil ? 1 : 0),
      }),
      { refs: 0, unites: 0, valeur: 0, alertes: 0 }
    );
  }, [villeItems]);

  // ---------- Commerciaux ----------
  const submitCommercial = async (e) => {
    e.preventDefault();
    if (!commercialForm.nom.trim()) return;
    try {
      const created = await db.createCommercial(commercialForm.nom.trim(), Number(commercialForm.commission) || 3050);
      setCommerciaux((cur) => [created, ...cur]);
      setCommercialModalOpen(false);
      setCommercialForm(emptyCommercialForm);
    } catch (err) {
      setSaveError(err.message || "Échec de la création du commercial.");
    }
  };
  const removeCommercial = async (id) => {
    try {
      await db.deleteCommercial(id);
      setCommerciaux((cur) => cur.filter((c) => c.id !== id));
    } catch (err) {
      setSaveError(err.message || "Échec de la suppression.");
    }
    setConfirmDeleteCommId(null);
  };
  const [editingCommercial, setEditingCommercial] = useState(null);
  const [editCommercialForm, setEditCommercialForm] = useState({ commission: "3050" });
  const openEditCommercial = (c) => {
    setEditingCommercial(c);
    setEditCommercialForm({ commission: String(c.commission) });
  };
  const submitEditCommercial = async (e) => {
    e.preventDefault();
    const commission = Number(editCommercialForm.commission) || 0;
    try {
      const updated = await db.updateCommercial(editingCommercial.id, { commission });
      setCommerciaux((cur) => cur.map((c) => (c.id === editingCommercial.id ? updated : c)));
      setEditingCommercial(null);
    } catch (err) {
      setSaveError(err.message || "Échec de la mise à jour.");
    }
  };

  // ---------- Ventes ----------
  const anySellableCount = useMemo(() => (items || []).filter((it) => it.quantite > 0).length, [items]);
  const [quartierDropdownOpen, setQuartierDropdownOpen] = useState(false);
  const quartiersCombines = (ville) => {
    const officiels = (QUARTIERS_PAR_VILLE[ville] || []).map(([nom, tarif]) => ({ nom, tarif }));
    const perso = quartiersPerso.filter((q) => q.ville === ville);
    return [...officiels, ...perso].sort((a, b) => a.nom.localeCompare(b.nom));
  };
  const saveNewQuartier = async () => {
    const nom = saleForm.quartier.trim();
    if (!nom) return;
    try {
      const created = await db.createQuartierPersonnalise({ ville: saleForm.ville, nom, tarif: saleForm.livraison });
      setQuartiersPerso((cur) => [...cur, created]);
    } catch (err) {
      setSaleError(err.message || "Échec de l'enregistrement du quartier.");
    }
  };
  const openSale = () => {
    setSaleForm({ ...emptySaleForm, ville, date: todayISODate(), lignes: [{ ...emptyLigne }] });
    setSaleError("");
    setQuartierDropdownOpen(false);
    setSaleModalOpen(true);
  };
  const saleVilleItems = useMemo(
    () => (items || []).filter((it) => it.ville === saleForm.ville && it.quantite > 0),
    [items, saleForm.ville]
  );
  const saleAllCommerciaux = commerciaux || [];

  const addLigne = () => setSaleForm((f) => ({ ...f, lignes: [...f.lignes, { ...emptyLigne }] }));
  const removeLigne = (idx) =>
    setSaleForm((f) => ({ ...f, lignes: f.lignes.length > 1 ? f.lignes.filter((_, i) => i !== idx) : f.lignes }));
  const updateLigne = (idx, patch) =>
    setSaleForm((f) => ({ ...f, lignes: f.lignes.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));

  const [submittingSale, setSubmittingSale] = useState(false);
  const submitSale = async (e) => {
    e.preventDefault();
    const commercial = (commerciaux || []).find((c) => c.id === saleForm.commercialId);
    if (!commercial) return setSaleError("Choisissez un commercial.");
    if (!saleForm.date) return setSaleError("Choisissez une date.");

    const resolved = [];
    for (const l of saleForm.lignes) {
      const item = items.find((i) => i.id === l.itemId);
      const qte = Number(l.quantite) || 0;
      if (!item) return setSaleError("Choisissez un article pour chaque ligne.");
      if (qte <= 0) return setSaleError("Chaque ligne doit avoir une quantité supérieure à 0.");
      if (qte > item.quantite) return setSaleError(`Stock insuffisant pour ${item.nom} (${item.quantite} disponible(s)).`);
      const prixVente = l.prixVente === "" ? item.prixVente : Number(l.prixVente);
      resolved.push({ item, qte, prixVente });
    }
    // Empêche de compter deux fois le même article s'il est choisi sur plusieurs lignes.
    const cumulParArticle = {};
    for (const r of resolved) {
      cumulParArticle[r.item.id] = (cumulParArticle[r.item.id] || 0) + r.qte;
      if (cumulParArticle[r.item.id] > r.item.quantite) {
        return setSaleError(`Stock insuffisant pour ${r.item.nom} au total (${r.item.quantite} disponible(s)).`);
      }
    }

    const livraisonMontant = saleForm.mode === "livraison" ? Number(saleForm.livraison) || 0 : 0;
    const expeditionMontant = saleForm.mode === "expedition" ? Number(saleForm.expedition) || 0 : 0;
    const commissionUnitaire = commercial.commission;
    const boitierUnitaire = parametres.boitier;
    const orderId = crypto.randomUUID();
    const dateISO = saleForm.date;

    const nouvellesVentes = resolved.map((r, idx) => ({
      orderId,
      date: dateISO,
      ville: r.item.ville,
      itemId: r.item.id,
      itemNom: r.item.nom,
      itemPhoto: r.item.photo || "",
      categorie: r.item.categorie,
      commercialId: commercial.id,
      commercialNom: commercial.nom,
      quantite: r.qte,
      quartier: saleForm.quartier || "",
      prixVenteUnitaire: r.prixVente,
      prixAchatUnitaire: r.item.prixAchat,
      boitierUnitaire,
      commissionUnitaire,
      // Les frais de livraison/expédition sont ceux de toute la commande : portés une seule fois, sur la première ligne.
      livraisonUnitaire: idx === 0 ? livraisonMontant : 0,
      expeditionUnitaire: idx === 0 ? expeditionMontant : 0,
    }));

    setSubmittingSale(true);
    try {
      const created = await db.createVentes(nouvellesVentes);
      setVentes((cur) => [...created, ...cur]);
      for (const [itemId, dec] of Object.entries(cumulParArticle)) {
        await db.adjustItemQuantite(itemId, -dec);
      }
      setItems((cur) => cur.map((it) => (cumulParArticle[it.id] ? { ...it, quantite: it.quantite - cumulParArticle[it.id] } : it)));

      const totalPaires = resolved.reduce((a, r) => a + r.qte, 0);
      const totalCommission = totalPaires * commissionUnitaire;
      const beneficeCommande =
        resolved.reduce((a, r) => a + r.qte * (r.prixVente - r.item.prixAchat - boitierUnitaire - commissionUnitaire), 0) -
        livraisonMontant -
        expeditionMontant;
      const detailArticles = resolved.map((r) => `${r.qte} × ${r.item.nom}`).join(", ");
      logMouvement(
        "vente",
        `Commande (${totalPaires} paire${totalPaires > 1 ? "s" : ""}) : ${detailArticles} — par ${commercial.nom} (commission ${fmtFCFA(totalCommission)}, bénéfice entreprise ${fmtFCFA(beneficeCommande)})`,
        saleForm.ville
      );
      setSaleModalOpen(false);
    } catch (err) {
      setSaleError(err.message || "Échec de l'enregistrement de la vente.");
    } finally {
      setSubmittingSale(false);
    }
  };

  // ---------- Échecs de livraison ----------
  const [echecModalOpen, setEchecModalOpen] = useState(false);
  const [echecForm, setEchecForm] = useState({
    ville: VILLES[0],
    commercialId: "",
    mode: "livraison",
    quartier: "",
    montant: 1000,
    date: "",
    note: "",
  });
  const [echecError, setEchecError] = useState("");
  const openEchec = () => {
    setEchecForm({
      ville,
      commercialId: "",
      mode: "livraison",
      quartier: "",
      montant: 1000,
      date: todayISODate(),
      note: "",
    });
    setEchecError("");
    setEchecModalOpen(true);
  };
  const submitEchec = async (e) => {
    e.preventDefault();
    const commercial = (commerciaux || []).find((c) => c.id === echecForm.commercialId);
    if (!commercial) return setEchecError("Choisissez un commercial.");
    if (!echecForm.date) return setEchecError("Choisissez une date.");
    const montant = Number(echecForm.montant) || 0;
    if (montant <= 0) return setEchecError("Le montant doit être supérieur à 0.");
    try {
      const created = await db.createEchec({
        date: echecForm.date,
        ville: echecForm.ville,
        commercialId: commercial.id,
        commercialNom: commercial.nom,
        montant,
        mode: echecForm.mode,
        quartier: echecForm.quartier,
        note: echecForm.note,
      });
      setEchecs((cur) => [created, ...cur]);
      logMouvement(
        "echec",
        `Livraison échouée : ${fmtFCFA(montant)} perdus (${commercial.nom})${echecForm.note ? " — " + echecForm.note : ""}`,
        echecForm.ville
      );
      setEchecModalOpen(false);
    } catch (err) {
      setEchecError(err.message || "Échec de l'enregistrement.");
    }
  };
  const removeEchec = async (id) => {
    try {
      await db.deleteEchec(id);
      setEchecs((cur) => cur.filter((x) => x.id !== id));
    } catch (err) {
      setSaveError(err.message || "Échec de la suppression.");
    }
  };

  const villeVentes = useMemo(() => (ventes || []).filter((v) => v.ville === ville), [ventes, ville]);
  const salesStats = useMemo(() => {
    return villeVentes.reduce(
      (a, v) => {
        const ca = v.quantite * v.prixVenteUnitaire;
        const coutTotal =
          v.quantite * (v.prixAchatUnitaire + v.boitierUnitaire + v.commissionUnitaire) +
          v.livraisonUnitaire +
          v.expeditionUnitaire;
        return {
          paires: a.paires + v.quantite,
          ca: a.ca + ca,
          commissions: a.commissions + v.quantite * v.commissionUnitaire,
          frais: a.frais + v.livraisonUnitaire + v.expeditionUnitaire,
          benefice: a.benefice + (ca - coutTotal),
        };
      },
      { paires: 0, ca: 0, commissions: 0, frais: 0, benefice: 0 }
    );
  }, [villeVentes]);

  const villeEchecs = useMemo(() => (echecs || []).filter((x) => x.ville === ville), [echecs, ville]);
  const echecsPertesTotal = useMemo(() => villeEchecs.reduce((a, x) => a + x.montant, 0), [villeEchecs]);

  const villeVentesFiltered = useMemo(() => {
    if (!venteQuery.trim()) return villeVentes;
    const q = venteQuery.toLowerCase();
    return villeVentes.filter(
      (v) =>
        v.itemNom.toLowerCase().includes(q) ||
        v.commercialNom.toLowerCase().includes(q) ||
        (v.quartier || "").toLowerCase().includes(q)
    );
  }, [villeVentes, venteQuery]);

  const openEditVente = (v) => {
    setEditingVente(v);
    setEditVenteForm({
      itemId: v.itemId,
      commercialId: v.commercialId,
      quantite: String(v.quantite),
      date: v.date.slice(0, 10),
      prixVente: String(v.prixVenteUnitaire),
    });
    setEditVenteError("");
  };
  const editVenteItems = useMemo(() => {
    if (!editingVente || !items) return [];
    return items.filter((it) => it.ville === editingVente.ville && (it.quantite > 0 || it.id === editingVente.itemId));
  }, [editingVente, items]);
  const submitEditVente = async (e) => {
    e.preventDefault();
    const nouvelleQte = Number(editVenteForm.quantite) || 0;
    const nouveauPrix = Number(editVenteForm.prixVente) || 0;
    if (nouvelleQte <= 0) return setEditVenteError("La quantité doit être supérieure à 0.");
    if (nouveauPrix <= 0) return setEditVenteError("Le prix de vente doit être supérieur à 0.");
    const oldItem = items.find((i) => i.id === editingVente.itemId);
    const newItem = items.find((i) => i.id === editVenteForm.itemId);
    const commercial = (commerciaux || []).find((c) => c.id === editVenteForm.commercialId);
    if (!newItem) return setEditVenteError("Choisissez un article.");
    if (!commercial) return setEditVenteError("Choisissez un commercial.");

    const itemChanged = oldItem && newItem.id !== oldItem.id;
    if (itemChanged) {
      if (nouvelleQte > newItem.quantite) {
        return setEditVenteError(`Stock insuffisant pour ${newItem.nom} (${newItem.quantite} disponible(s)).`);
      }
    } else {
      const delta = nouvelleQte - editingVente.quantite;
      if (delta > 0 && delta > newItem.quantite) {
        return setEditVenteError(`Stock insuffisant pour augmenter cette vente (${newItem.quantite} disponible(s)).`);
      }
    }

    try {
      const patch = {
        itemId: newItem.id,
        itemNom: newItem.nom,
        itemPhoto: newItem.photo || "",
        categorie: newItem.categorie,
        prixVenteUnitaire: nouveauPrix,
        prixAchatUnitaire: newItem.prixAchat,
        commercialId: commercial.id,
        commercialNom: commercial.nom,
        quantite: nouvelleQte,
        date: editVenteForm.date,
      };
      const updated = await db.updateVente(editingVente.id, patch);
      setVentes((cur) => cur.map((v) => (v.id === editingVente.id ? updated : v)));

      if (itemChanged) {
        await db.adjustItemQuantite(oldItem.id, editingVente.quantite);
        await db.adjustItemQuantite(newItem.id, -nouvelleQte);
        setItems((cur) =>
          cur.map((it) => {
            if (it.id === oldItem.id) return { ...it, quantite: it.quantite + editingVente.quantite };
            if (it.id === newItem.id) return { ...it, quantite: it.quantite - nouvelleQte };
            return it;
          })
        );
      } else {
        const delta = nouvelleQte - editingVente.quantite;
        if (delta !== 0) {
          await db.adjustItemQuantite(newItem.id, -delta);
          setItems((cur) => cur.map((it) => (it.id === newItem.id ? { ...it, quantite: it.quantite - delta } : it)));
        }
      }

      logMouvement(
        "modification",
        `Vente modifiée : ${editingVente.itemNom} (${editingVente.commercialNom}) → ${newItem.nom} × ${nouvelleQte} (${commercial.nom})`,
        editingVente.ville
      );
      setEditingVente(null);
    } catch (err) {
      setEditVenteError(err.message || "Échec de la modification.");
    }
  };
  const cancelVente = async (v) => {
    try {
      await db.deleteVente(v.id);
      setVentes((cur) => cur.filter((x) => x.id !== v.id));
      const item = items.find((i) => i.id === v.itemId);
      if (item) {
        await db.adjustItemQuantite(item.id, v.quantite);
        setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, quantite: it.quantite + v.quantite } : it)));
      }
      logMouvement("suppression", `Vente annulée : ${v.quantite} × ${v.itemNom} (stock restitué)`, v.ville);
    } catch (err) {
      setSaveError(err.message || "Échec de l'annulation.");
    }
    setConfirmDeleteVenteId(null);
  };

  // ---------- Fiche de paie ----------
  const periodBounds = (period, customFrom, customTo) => {
    const now = new Date();
    if (period === "month") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    if (period === "week") {
      const from = new Date(now);
      from.setDate(now.getDate() - 7);
      return { from, to: now };
    }
    if (period === "custom") {
      const from = customFrom ? new Date(customFrom) : new Date(0);
      const to = customTo ? new Date(customTo + "T23:59:59") : now;
      return { from, to };
    }
    return { from: new Date(0), to: now };
  };
  const payslipVentes = useMemo(() => {
    if (!payslipFor || !ventes) return [];
    const { from, to } = periodBounds(payslipPeriod, payslipCustomFrom, payslipCustomTo);
    return ventes
      .filter((v) => v.commercialId === payslipFor.id)
      .filter((v) => {
        const d = new Date(v.date);
        return d >= from && d <= to;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [payslipFor, payslipPeriod, payslipCustomFrom, payslipCustomTo, ventes]);
  const payslipTotal = payslipVentes.reduce((a, v) => a + v.quantite * v.commissionUnitaire, 0);
  const payslipPaires = payslipVentes.reduce((a, v) => a + v.quantite, 0);
  const payslipBoostNum = Number(payslipBoost) || 0;
  const payslipNet = payslipTotal - payslipBoostNum;

  const statsForVentes = useMemo(() => {
    if (!statsFor || !ventes) return [];
    return ventes.filter((v) => v.commercialId === statsFor.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [statsFor, ventes]);
  const statsForTotals = statsForVentes.reduce(
    (a, v) => ({
      paires: a.paires + v.quantite,
      ca: a.ca + v.quantite * v.prixVenteUnitaire,
      commission: a.commission + v.quantite * v.commissionUnitaire,
    }),
    { paires: 0, ca: 0, commission: 0 }
  );

  // ---------- Bilan entreprise (toutes villes, découpé par secteur) ----------
  const SECTEURS = ["Photochromique", "Blue Protect", "Solaire"];
  const [bilanSecteur, setBilanSecteur] = useState(SECTEURS[0]);
  const bilanVentesToutesCategories = useMemo(() => {
    if (!ventes) return [];
    const { from, to } = periodBounds(bilanPeriod, bilanCustomFrom, bilanCustomTo);
    return ventes.filter((v) => {
      const d = new Date(v.date);
      return d >= from && d <= to;
    });
  }, [ventes, bilanPeriod, bilanCustomFrom, bilanCustomTo]);
  const bilanVentes = useMemo(
    () => bilanVentesToutesCategories.filter((v) => v.categorie === bilanSecteur),
    [bilanVentesToutesCategories, bilanSecteur]
  );
  const bilan = bilanVentes.reduce(
    (a, v) => {
      const ca = v.quantite * v.prixVenteUnitaire;
      const achatTotal = v.quantite * v.prixAchatUnitaire;
      const boitierTotal = v.quantite * v.boitierUnitaire;
      const commissionTotal = v.quantite * v.commissionUnitaire;
      const fraisTotal = v.livraisonUnitaire + v.expeditionUnitaire;
      return {
        paires: a.paires + v.quantite,
        boitiers: a.boitiers + v.quantite,
        ca: a.ca + ca,
        achat: a.achat + achatTotal,
        boitierCout: a.boitierCout + boitierTotal,
        commissions: a.commissions + commissionTotal,
        frais: a.frais + fraisTotal,
        benefice: a.benefice + (ca - achatTotal - boitierTotal - commissionTotal - fraisTotal),
      };
    },
    { paires: 0, boitiers: 0, ca: 0, achat: 0, boitierCout: 0, commissions: 0, frais: 0, benefice: 0 }
  );

  // Les échecs de livraison ne sont pas rattachés à un secteur précis : comptés une seule fois, en dehors des 3 bilans.
  const bilanEchecs = useMemo(() => {
    if (!echecs) return [];
    const { from, to } = periodBounds(bilanPeriod, bilanCustomFrom, bilanCustomTo);
    return echecs.filter((x) => {
      const d = new Date(x.date);
      return d >= from && d <= to;
    });
  }, [echecs, bilanPeriod, bilanCustomFrom, bilanCustomTo]);
  const pertesLivraisonRatee = bilanEchecs.reduce((a, x) => a + x.montant, 0);

  // Comparateur de mois : cumule toujours toutes les ventes du secteur sélectionné, indépendamment du filtre de période ci-dessus.
  const monthlyComparison = useMemo(() => {
    if (!ventes) return [];
    const map = {};
    for (const v of ventes) {
      if (v.categorie !== bilanSecteur) continue;
      const d = new Date(v.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { key, label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), paires: 0, ca: 0 };
      map[key].paires += v.quantite;
      map[key].ca += v.quantite * v.prixVenteUnitaire;
    }
    return Object.values(map).sort((a, b) => (a.key < b.key ? 1 : -1)).slice(0, 12);
  }, [ventes, bilanSecteur]);
  const bestMonth = monthlyComparison.reduce((best, m) => (!best || m.paires > best.paires ? m : best), null);
  const worstMonth = monthlyComparison.reduce((worst, m) => (!worst || m.paires < worst.paires ? m : worst), null);

  // Classement des modèles sur la période du bilan sélectionnée, dans ce secteur.
  const modelRanking = useMemo(() => {
    const map = {};
    for (const v of bilanVentes) {
      if (!map[v.itemNom]) map[v.itemNom] = { nom: v.itemNom, paires: 0, ca: 0 };
      map[v.itemNom].paires += v.quantite;
      map[v.itemNom].ca += v.quantite * v.prixVenteUnitaire;
    }
    return Object.values(map).sort((a, b) => b.paires - a.paires);
  }, [bilanVentes]);

  const sellerRanking = useMemo(() => {
    const map = {};
    for (const v of bilanVentes) {
      if (!map[v.commercialId]) map[v.commercialId] = { nom: v.commercialNom, paires: 0, commission: 0 };
      map[v.commercialId].paires += v.quantite;
      map[v.commercialId].commission += v.quantite * v.commissionUnitaire;
    }
    return Object.values(map).sort((a, b) => b.paires - a.paires);
  }, [bilanVentes]);

  // ---------- Paramètres ----------
  const submitParams = async (e) => {
    e.preventDefault();
    const next = { boitier: Number(paramsForm.boitier) || 0, commission: Number(paramsForm.commission) || 0 };
    try {
      await db.updateParametres(next);
      setParametres(next);
      setParamsModalOpen(false);
    } catch (err) {
      setSaveError(err.message || "Échec de l'enregistrement des paramètres.");
    }
  };

  const loading = items === null || commerciaux === null || ventes === null || mouvements === null || parametres === null;
  const lowStockItems = useMemo(() => (items || []).filter((it) => it.quantite <= it.seuil), [items]);

  return (
    <div style={styles.page}>
      <style>{fontImports}</style>

      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.lensMark}>
            <span style={styles.lensMarkInner} />
          </div>
          <div>
            <h1 style={styles.brandName}>Nyanga Optique</h1>
            <p style={styles.brandSub}>Gestion de stock &amp; ventes</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.bilanHeaderBtn} onClick={() => setBilanOpen(true)} title="Bilan entreprise">
            <BarChart3 size={16} />
            Bilan
          </button>
          <button style={styles.iconOnlyBtn} onClick={() => setParamsModalOpen(true)} title="Paramètres">
            <Settings size={17} />
          </button>
        </div>
      </header>

      {loadError && (
        <div style={styles.lowStockBanner}>
          <TriangleAlert size={16} />
          <span>Impossible de charger les données : {loadError}. Vérifie tes variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.</span>
        </div>
      )}

      {!loading && lowStockItems.length > 0 && (
        <div style={styles.lowStockBanner} onClick={() => { setTab("stock"); }}>
          <TriangleAlert size={16} />
          <span>
            <strong>{lowStockItems.length}</strong> modèle{lowStockItems.length > 1 ? "s" : ""} en stock bas :{" "}
            {lowStockItems.slice(0, 4).map((it) => `${it.nom} (${it.ville}, ${it.quantite})`).join(", ")}
            {lowStockItems.length > 4 ? "…" : ""}
          </span>
        </div>
      )}

      <nav style={styles.mainTabs}>
        {[
          { id: "stock", label: "Stock", icon: <Glasses size={15} /> },
          { id: "ventes", label: "Ventes", icon: <ShoppingBag size={15} /> },
          { id: "commerciaux", label: "Commerciaux", icon: <Users size={15} /> },
          { id: "mouvements", label: "Mouvements", icon: <History size={15} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...styles.mainTab, ...(tab === t.id ? styles.mainTabActive : {}) }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {tab !== "commerciaux" && (
        <div style={styles.cityTabs}>
          {VILLES.map((v) => (
            <button
              key={v}
              onClick={() => setVille(v)}
              style={{ ...styles.cityTab, ...(ville === v ? styles.cityTabActive : {}) }}
            >
              <MapPin size={14} />
              {v}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={styles.emptyState}>Chargement…</div>
      ) : (
        <>
          {tab === "stock" && (
            <StockTab
              stats={stockStats}
              query={query}
              setQuery={setQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              filtered={filtered}
              villeItems={villeItems}
              ville={ville}
              openAddItem={openAddItem}
              openEditItem={openEditItem}
              setTransferItem={setTransferItem}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              removeItem={removeItem}
              setLightboxPhoto={setLightboxPhoto}
            />
          )}

          {tab === "ventes" && (
            <VentesTab
              ville={ville}
              stats={salesStats}
              ventes={villeVentesFiltered}
              openSale={openSale}
              sellableCount={anySellableCount}
              venteQuery={venteQuery}
              setVenteQuery={setVenteQuery}
              openEditVente={openEditVente}
              confirmDeleteVenteId={confirmDeleteVenteId}
              setConfirmDeleteVenteId={setConfirmDeleteVenteId}
              cancelVente={cancelVente}
              openEchec={openEchec}
              villeEchecs={villeEchecs}
              echecsPertesTotal={echecsPertesTotal}
              removeEchec={removeEchec}
            />
          )}

          {tab === "commerciaux" && (
            <CommerciauxTab
              commerciaux={commerciaux}
              ventes={ventes}
              openAdd={() => setCommercialModalOpen(true)}
              confirmDeleteCommId={confirmDeleteCommId}
              setConfirmDeleteCommId={setConfirmDeleteCommId}
              removeCommercial={removeCommercial}
              openPayslip={(c) => {
                setPayslipFor(c);
                setPayslipPeriod("month");
                setPayslipCustomFrom("");
                setPayslipCustomTo("");
                setPayslipBoost("0");
              }}
              openStats={(c) => setStatsFor(c)}
              openEditCommercial={openEditCommercial}
            />
          )}

          {tab === "mouvements" && <MouvementsTab mouvements={(mouvements || []).filter((m) => !m.ville || m.ville === ville)} />}
        </>
      )}

      {saveError && (
        <div style={styles.saveError}>{saveError}</div>
      )}

      {/* ---- Modals ---- */}

      {transferItem && (
        <div style={styles.overlay} onClick={() => setTransferItem(null)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Transférer cet article</h3>
            <p style={styles.transferText}>
              Déplacer <strong>{transferItem.nom}</strong> de <strong>{transferItem.ville}</strong> vers{" "}
              <strong>{transferItem.ville === "Yaoundé" ? "Douala" : "Yaoundé"}</strong> ?
            </p>
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => setTransferItem(null)}>
                Annuler
              </button>
              <button style={styles.saveBtn} onClick={() => doTransfer(transferItem.id)}>
                Transférer
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxPhoto && (
        <div style={styles.overlay} onClick={() => setLightboxPhoto(null)}>
          <img src={lightboxPhoto} alt="Monture" style={styles.lightboxImg} />
        </div>
      )}

      {itemModalOpen && (
        <div style={styles.overlay} onClick={() => setItemModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingId ? "Modifier l'article" : "Nouvel article"}</h2>
              <button style={styles.closeBtn} onClick={() => setItemModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitItemForm} style={styles.form}>
              <div style={styles.photoRow}>
                <div style={styles.photoPreviewWrap} onClick={() => fileInputRef.current?.click()}>
                  {itemForm.photo ? (
                    <img src={itemForm.photo} alt="Aperçu" style={styles.photoPreview} />
                  ) : (
                    <div style={styles.photoPlaceholder}>
                      <Camera size={20} color="#a37b8c" />
                    </div>
                  )}
                </div>
                <div>
                  <button type="button" style={styles.photoBtn} onClick={() => fileInputRef.current?.click()}>
                    {itemForm.photo ? "Changer la photo" : "Ajouter une photo"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                  {!editingId && <p style={styles.photoHint}>Stock : {ville}</p>}
                </div>
              </div>

              <div style={styles.formRow}>
                <Field label="Référence">
                  <input style={styles.input} value={itemForm.reference} onChange={(e) => setItemForm({ ...itemForm, reference: e.target.value })} placeholder="NY-001" />
                </Field>
                <Field label="Modèle *">
                  <input style={styles.input} value={itemForm.nom} onChange={(e) => setItemForm({ ...itemForm, nom: e.target.value })} placeholder="Monture ronde écaille" required />
                </Field>
              </div>
              <div style={styles.formRow}>
                <Field label="Catégorie">
                  <select style={styles.input} value={itemForm.categorie} onChange={(e) => setItemForm({ ...itemForm, categorie: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Couleur">
                  <input style={styles.input} value={itemForm.couleur} onChange={(e) => setItemForm({ ...itemForm, couleur: e.target.value })} placeholder="Noir" />
                </Field>
              </div>
              <div style={styles.formRow}>
                <Field label="Quantité">
                  <input style={styles.input} type="number" min="0" value={itemForm.quantite} onChange={(e) => setItemForm({ ...itemForm, quantite: e.target.value })} />
                </Field>
                <Field label="Seuil d'alerte">
                  <input style={styles.input} type="number" min="0" value={itemForm.seuil} onChange={(e) => setItemForm({ ...itemForm, seuil: e.target.value })} />
                </Field>
              </div>
              <div style={styles.formRow}>
                <Field label="Prix d'achat (FCFA)">
                  <input style={styles.input} type="number" min="0" value={itemForm.prixAchat} onChange={(e) => setItemForm({ ...itemForm, prixAchat: e.target.value })} />
                </Field>
                <Field label="Prix de vente (FCFA)">
                  <input style={styles.input} type="number" min="0" value={itemForm.prixVente} onChange={(e) => setItemForm({ ...itemForm, prixVente: e.target.value })} />
                </Field>
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setItemModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingId ? "Enregistrer" : "Ajouter au stock"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saleModalOpen && (
        <div style={styles.overlay} onClick={() => setSaleModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Enregistrer une vente</h2>
              <button style={styles.closeBtn} onClick={() => setSaleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitSale} style={styles.form}>
              <Field label="Ville / stock concerné *">
                <div style={styles.checkRow}>
                  {VILLES.map((v) => (
                    <button
                      type="button"
                      key={v}
                      style={{ ...styles.checkChip, ...(saleForm.ville === v ? styles.checkChipActive : {}) }}
                      onClick={() => setSaleForm({ ...saleForm, ville: v, quartier: "", lignes: [{ ...emptyLigne }] })}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Date de la vente *">
                <input
                  style={styles.input}
                  type="date"
                  value={saleForm.date}
                  max={todayISODate()}
                  onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  required
                />
              </Field>

              <Field label="Articles *">
                <div style={styles.lignesWrap}>
                  {saleForm.lignes.map((l, idx) => {
                    const selectedItem = items.find((i) => i.id === l.itemId);
                    return (
                      <div key={idx} style={styles.ligneCard}>
                        <div style={styles.ligneRow}>
                          {selectedItem?.photo ? (
                            <img src={selectedItem.photo} alt={selectedItem.nom} style={styles.ligneThumb} />
                          ) : (
                            <div style={styles.ligneThumbPlaceholder}>
                              <Glasses size={14} color="#a37b8c" />
                            </div>
                          )}
                          <select
                            style={{ ...styles.input, flex: 2 }}
                            value={l.itemId}
                            onChange={(e) => {
                              const it = items.find((i) => i.id === e.target.value);
                              updateLigne(idx, { itemId: e.target.value, prixVente: it ? String(it.prixVente) : "" });
                            }}
                            required
                          >
                            <option value="">Choisir un article…</option>
                            {saleVilleItems.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.nom} {it.reference ? `(${it.reference})` : ""} — {it.quantite} en stock
                              </option>
                            ))}
                          </select>
                          <input
                            style={{ ...styles.input, flex: "0 0 56px" }}
                            type="number"
                            min="1"
                            value={l.quantite}
                            onChange={(e) => updateLigne(idx, { quantite: e.target.value })}
                          />
                          {saleForm.lignes.length > 1 && (
                            <button type="button" style={styles.removeLigneBtn} onClick={() => removeLigne(idx)}>
                              <X size={15} />
                            </button>
                          )}
                        </div>
                        {selectedItem && (
                          <div style={styles.lignePriceRow}>
                            <span style={styles.lignePriceLabel}>Prix de vente (réduction éventuelle) :</span>
                            <input
                              style={{ ...styles.input, flex: "0 0 110px" }}
                              type="number"
                              min="0"
                              value={l.prixVente}
                              onChange={(e) => updateLigne(idx, { prixVente: e.target.value })}
                            />
                            <span style={styles.ligneOriginalPrice}>
                              {Number(l.prixVente) !== selectedItem.prixVente ? `(prix normal : ${fmtFCFA(selectedItem.prixVente)})` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button type="button" style={styles.addLigneBtn} onClick={addLigne}>
                  <Plus size={14} /> Ajouter un article
                </button>
                {saleVilleItems.length === 0 && <p style={styles.photoHint}>Aucun article disponible à {saleForm.ville}.</p>}
              </Field>

              <Field label="Commercial *">
                <select style={styles.input} value={saleForm.commercialId} onChange={(e) => setSaleForm({ ...saleForm, commercialId: e.target.value })} required>
                  <option value="">Choisir un commercial…</option>
                  {saleAllCommerciaux.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </Field>
              <Field label="Mode (pour toute la commande)">
                <div style={styles.checkRow}>
                  <button
                    type="button"
                    style={{ ...styles.checkChip, ...(saleForm.mode === "livraison" ? styles.checkChipActive : {}) }}
                    onClick={() => setSaleForm({ ...saleForm, mode: "livraison" })}
                  >
                    Livraison ({saleForm.ville})
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.checkChip, ...(saleForm.mode === "expedition" ? styles.checkChipActive : {}) }}
                    onClick={() => setSaleForm({ ...saleForm, mode: "expedition" })}
                  >
                    Expédition (autre ville)
                  </button>
                </div>
              </Field>
              {saleForm.mode === "livraison" ? (
                <>
                  <Field label="Lieu de livraison (quartier)">
                    <div style={styles.quartierWrap}>
                      <input
                        style={styles.input}
                        value={saleForm.quartier}
                        onChange={(e) => {
                          setSaleForm({ ...saleForm, quartier: e.target.value });
                          setQuartierDropdownOpen(true);
                        }}
                        onFocus={() => setQuartierDropdownOpen(true)}
                        placeholder="Tape les premières lettres du quartier…"
                      />
                      {quartierDropdownOpen && (() => {
                        const typed = saleForm.quartier.trim().toLowerCase();
                        const matches = quartiersCombines(saleForm.ville).filter((qt) =>
                          typed ? qt.nom.toLowerCase().startsWith(typed) : true
                        );
                        return (
                          <div style={styles.quartierDropdown}>
                            {matches.length > 0 ? (
                              matches.slice(0, 30).map((qt) => (
                                <button
                                  type="button"
                                  key={qt.nom}
                                  style={styles.quartierOption}
                                  onClick={() => {
                                    setSaleForm({ ...saleForm, quartier: qt.nom, livraison: qt.tarif });
                                    setQuartierDropdownOpen(false);
                                  }}
                                >
                                  <span>{qt.nom}</span>
                                  <span style={styles.quartierOptionTarif}>{qt.tarif.toLocaleString("fr-FR")} FCFA</span>
                                </button>
                              ))
                            ) : typed ? (
                              <div style={styles.quartierNoMatch}>
                                Aucun quartier « {saleForm.quartier.trim()} » enregistré.
                                <button type="button" style={styles.saveQuartierBtn} onClick={() => { saveNewQuartier(); setQuartierDropdownOpen(false); }}>
                                  <Plus size={13} /> Enregistrer avec le tarif {saleForm.livraison.toLocaleString("fr-FR")} FCFA choisi ci-dessous
                                </button>
                              </div>
                            ) : (
                              <div style={styles.quartierNoMatch}>Commence à taper pour chercher un quartier.</div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Field>
                  <Field label="Frais de livraison pour la commande (FCFA)">
                    <div style={styles.checkRow}>
                      {LIVRAISON_OPTIONS.map((v) => (
                        <button
                          type="button"
                          key={v}
                          style={{ ...styles.checkChip, ...(saleForm.livraison === v ? styles.checkChipActive : {}) }}
                          onClick={() => setSaleForm({ ...saleForm, livraison: v })}
                        >
                          {v.toLocaleString("fr-FR")}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Ville / lieu d'expédition">
                    <input
                      style={styles.input}
                      value={saleForm.quartier}
                      onChange={(e) => setSaleForm({ ...saleForm, quartier: e.target.value })}
                      placeholder="Ex : Bafoussam, Kribi…"
                    />
                  </Field>
                  <Field label="Frais d'expédition pour la commande (FCFA)">
                    <div style={styles.checkRow}>
                      {EXPEDITION_OPTIONS.map((v) => (
                        <button
                          type="button"
                          key={v}
                          style={{ ...styles.checkChip, ...(saleForm.expedition === v ? styles.checkChipActive : {}) }}
                          onClick={() => setSaleForm({ ...saleForm, expedition: v })}
                        >
                          {v.toLocaleString("fr-FR")}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}
              {saleForm.lignes.some((l) => l.itemId) && (
                <div style={styles.livePreview}>
                  Bénéfice entreprise estimé :{" "}
                  <strong>
                    {fmtFCFA(
                      saleForm.lignes.reduce((a, l) => {
                        const it = items.find((i) => i.id === l.itemId);
                        if (!it) return a;
                        const qte = Number(l.quantite) || 0;
                        const pv = l.prixVente === "" ? it.prixVente : Number(l.prixVente);
                        const commissionEstimee =
                          (commerciaux || []).find((c) => c.id === saleForm.commercialId)?.commission ??
                          parametres.commission;
                        return a + qte * (pv - it.prixAchat - parametres.boitier - commissionEstimee);
                      }, 0) - (saleForm.mode === "livraison" ? Number(saleForm.livraison) || 0 : Number(saleForm.expedition) || 0)
                    )}
                  </strong>
                </div>
              )}
              {saleError && <p style={styles.errorText}>{saleError}</p>}
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setSaleModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer la vente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {echecModalOpen && (
        <div style={styles.overlay} onClick={() => setEchecModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Livraison échouée</h2>
              <button style={styles.closeBtn} onClick={() => setEchecModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitEchec} style={styles.form}>
              <p style={styles.transferText}>
                Le client n'a pas pris la paire et n'a pas payé la livraison. Ceci enregistre uniquement la perte — le stock n'est pas touché.
              </p>
              <Field label="Ville *">
                <div style={styles.checkRow}>
                  {VILLES.map((v) => (
                    <button
                      type="button"
                      key={v}
                      style={{ ...styles.checkChip, ...(echecForm.ville === v ? styles.checkChipActive : {}) }}
                      onClick={() => setEchecForm({ ...echecForm, ville: v, commercialId: "" })}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Commercial responsable *">
                <select
                  style={styles.input}
                  value={echecForm.commercialId}
                  onChange={(e) => setEchecForm({ ...echecForm, commercialId: e.target.value })}
                  required
                >
                  <option value="">Choisir un commercial…</option>
                  {(commerciaux || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input
                  style={styles.input}
                  type="date"
                  max={todayISODate()}
                  value={echecForm.date}
                  onChange={(e) => setEchecForm({ ...echecForm, date: e.target.value })}
                />
              </Field>
              <Field label="Mode">
                <div style={styles.checkRow}>
                  <button
                    type="button"
                    style={{ ...styles.checkChip, ...(echecForm.mode === "livraison" ? styles.checkChipActive : {}) }}
                    onClick={() => setEchecForm({ ...echecForm, mode: "livraison" })}
                  >
                    Livraison
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.checkChip, ...(echecForm.mode === "expedition" ? styles.checkChipActive : {}) }}
                    onClick={() => setEchecForm({ ...echecForm, mode: "expedition" })}
                  >
                    Expédition
                  </button>
                </div>
              </Field>
              <Field label="Montant perdu (FCFA)">
                <div style={styles.checkRow}>
                  {(echecForm.mode === "livraison" ? LIVRAISON_OPTIONS : EXPEDITION_OPTIONS).map((v) => (
                    <button
                      type="button"
                      key={v}
                      style={{ ...styles.checkChip, ...(echecForm.montant === v ? styles.checkChipActive : {}) }}
                      onClick={() => setEchecForm({ ...echecForm, montant: v })}
                    >
                      {v.toLocaleString("fr-FR")}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Note (facultatif)">
                <input
                  style={styles.input}
                  value={echecForm.note}
                  onChange={(e) => setEchecForm({ ...echecForm, note: e.target.value })}
                  placeholder="Ex : client injoignable, a refusé le modèle…"
                />
              </Field>
              {echecError && <p style={styles.errorText}>{echecError}</p>}
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEchecModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer la perte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingVente && (
        <div style={styles.overlay} onClick={() => setEditingVente(null)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Modifier la vente</h3>
            <p style={styles.transferText}>{editingVente.ville}</p>
            <form onSubmit={submitEditVente} style={{ ...styles.form, padding: "12px 0 0" }}>
              <Field label="Article">
                <select
                  style={styles.input}
                  value={editVenteForm.itemId}
                  onChange={(e) => {
                    const it = items.find((i) => i.id === e.target.value);
                    setEditVenteForm({ ...editVenteForm, itemId: e.target.value, prixVente: it ? String(it.prixVente) : editVenteForm.prixVente });
                  }}
                >
                  {editVenteItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.nom} {it.reference ? `(${it.reference})` : ""} — {it.quantite} en stock
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Commercial">
                <select
                  style={styles.input}
                  value={editVenteForm.commercialId}
                  onChange={(e) => setEditVenteForm({ ...editVenteForm, commercialId: e.target.value })}
                >
                  {(commerciaux || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </Field>
              <div style={styles.formRow}>
                <Field label="Quantité">
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    value={editVenteForm.quantite}
                    onChange={(e) => setEditVenteForm({ ...editVenteForm, quantite: e.target.value })}
                  />
                </Field>
                <Field label="Prix de vente (FCFA)">
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    value={editVenteForm.prixVente}
                    onChange={(e) => setEditVenteForm({ ...editVenteForm, prixVente: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Date">
                <input
                  style={styles.input}
                  type="date"
                  max={todayISODate()}
                  value={editVenteForm.date}
                  onChange={(e) => setEditVenteForm({ ...editVenteForm, date: e.target.value })}
                />
              </Field>
              {editVenteError && <p style={styles.errorText}>{editVenteError}</p>}
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEditingVente(null)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {commercialModalOpen && (
        <div style={styles.overlay} onClick={() => setCommercialModalOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Nouveau commercial</h3>
            <form onSubmit={submitCommercial} style={{ ...styles.form, padding: "16px 0 0" }}>
              <Field label="Nom *">
                <input style={styles.input} value={commercialForm.nom} onChange={(e) => setCommercialForm({ ...commercialForm, nom: e.target.value })} placeholder="Nom complet" required />
              </Field>
              <Field label="Commission par paire vendue (FCFA)">
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={commercialForm.commission}
                  onChange={(e) => setCommercialForm({ ...commercialForm, commission: e.target.value })}
                />
              </Field>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setCommercialModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCommercial && (
        <div style={styles.overlay} onClick={() => setEditingCommercial(null)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Commission — {editingCommercial.nom}</h3>
            <form onSubmit={submitEditCommercial} style={{ ...styles.form, padding: "16px 0 0" }}>
              <Field label="Commission par paire vendue (FCFA)">
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={editCommercialForm.commission}
                  onChange={(e) => setEditCommercialForm({ commission: e.target.value })}
                />
              </Field>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEditingCommercial(null)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paramsModalOpen && (
        <div style={styles.overlay} onClick={() => setParamsModalOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Paramètres</h3>
            <form onSubmit={submitParams} style={{ ...styles.form, padding: "16px 0 0" }}>
              <Field label="Coût du boîtier (FCFA)">
                <input style={styles.input} type="number" min="0" value={paramsForm.boitier} onChange={(e) => setParamsForm({ ...paramsForm, boitier: e.target.value })} />
              </Field>
              <Field label="Commission par paire vendue (FCFA)">
                <input style={styles.input} type="number" min="0" value={paramsForm.commission} onChange={(e) => setParamsForm({ ...paramsForm, commission: e.target.value })} />
              </Field>
              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setParamsModalOpen(false)}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payslipFor && (
        <div style={styles.overlay} onClick={() => setPayslipFor(null)}>
          <div style={styles.payslipWrap} onClick={(e) => e.stopPropagation()}>
            <div style={styles.payslipTopBar}>
              <select
                style={styles.periodSelect}
                value={payslipPeriod}
                onChange={(e) => setPayslipPeriod(e.target.value)}
              >
                <option value="week">7 derniers jours</option>
                <option value="month">Ce mois-ci</option>
                <option value="custom">Période personnalisée</option>
                <option value="all">Toute la période</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={styles.printBtn}
                  onClick={() => {
                    const periodLabel =
                      payslipPeriod === "week"
                        ? "7 derniers jours"
                        : payslipPeriod === "month"
                        ? "Ce mois-ci"
                        : payslipPeriod === "custom"
                        ? `${payslipCustomFrom ? fmtDate(payslipCustomFrom) : "…"} au ${payslipCustomTo ? fmtDate(payslipCustomTo) : "…"}`
                        : "Toute la période";
                    downloadPayslipPdf({ commercial: payslipFor, ventes: payslipVentes, periodLabel, boost: payslipBoostNum });
                  }}
                >
                  <Download size={14} /> Télécharger le PDF
                </button>
                <button style={styles.closeBtnDark} onClick={() => setPayslipFor(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {payslipPeriod === "custom" && (
              <div style={styles.customDateRow}>
                <Field label="Du">
                  <input style={styles.input} type="date" value={payslipCustomFrom} onChange={(e) => setPayslipCustomFrom(e.target.value)} />
                </Field>
                <Field label="Au">
                  <input style={styles.input} type="date" value={payslipCustomTo} onChange={(e) => setPayslipCustomTo(e.target.value)} />
                </Field>
              </div>
            )}

            <div style={styles.boostRow}>
              <Field label="Prix du boost à déduire (FCFA)">
                <input style={styles.input} type="number" min="0" value={payslipBoost} onChange={(e) => setPayslipBoost(e.target.value)} placeholder="0" />
              </Field>
            </div>

            <div style={styles.payslipPaper} id="payslip-paper">
              <div style={styles.payslipHeader}>
                <div>
                  <div style={styles.payslipBrand}>Nyanga Optique</div>
                  <div style={styles.payslipSub}>Fiche de commission</div>
                </div>
                <div style={styles.payslipMeta}>
                  <div><strong>Commercial :</strong> {payslipFor.nom}</div>
                  <div>
                    <strong>Période :</strong>{" "}
                    {payslipPeriod === "week"
                      ? "7 derniers jours"
                      : payslipPeriod === "month"
                      ? "Ce mois-ci"
                      : payslipPeriod === "custom"
                      ? `${payslipCustomFrom ? fmtDate(payslipCustomFrom) : "…"} au ${payslipCustomTo ? fmtDate(payslipCustomTo) : "…"}`
                      : "Toute la période"}
                  </div>
                  <div><strong>Émise le :</strong> {fmtDate(new Date().toISOString())}</div>
                </div>
              </div>

              <table style={styles.payslipTable}>
                <thead>
                  <tr>
                    <th style={styles.payslipTh}>Date</th>
                    <th style={styles.payslipTh}>Article</th>
                    <th style={styles.payslipTh}>Quartier</th>
                    <th style={styles.payslipTh}>Qté</th>
                    <th style={styles.payslipTh}>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {payslipVentes.length === 0 ? (
                    <tr><td colSpan={5} style={styles.payslipEmptyRow}>Aucune vente sur cette période.</td></tr>
                  ) : (
                    payslipVentes.map((v) => (
                      <tr key={v.id}>
                        <td style={styles.payslipTd}>{fmtDate(v.date)}</td>
                        <td style={styles.payslipTd}>{v.itemNom}</td>
                        <td style={styles.payslipTd}>{v.quartier || "—"}</td>
                        <td style={styles.payslipTd}>{v.quantite}</td>
                        <td style={styles.payslipTd}>{fmtFCFA(v.quantite * v.commissionUnitaire)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={styles.payslipSubtotals}>
                <div>Paires vendues : <strong>{payslipPaires}</strong></div>
                <div>Total commissions : <strong>{fmtFCFA(payslipTotal)}</strong></div>
                {payslipBoostNum > 0 && <div>Boost déduit : <strong>− {fmtFCFA(payslipBoostNum)}</strong></div>}
              </div>
              <div style={styles.payslipTotalsRow}>
                <div>Salaire de la période</div>
                <div style={styles.payslipGrandTotal}>{fmtFCFA(payslipNet)}</div>
              </div>

              <div style={styles.payslipFooter}>
                <div style={styles.signatureBox}>Signature responsable</div>
                <div style={styles.signatureBox}>Signature commercial</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statsFor && (
        <div style={styles.overlay} onClick={() => setStatsFor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{statsFor.nom}</h2>
              <button style={styles.closeBtn} onClick={() => setStatsFor(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={styles.commVille}><MapPin size={12} /> Yaoundé &amp; Douala</div>
              <section style={{ ...styles.statsRow, marginTop: 14 }}>
                <StatCard icon={<ShoppingBag size={18} />} label="Paires vendues" value={statsForTotals.paires} />
                <StatCard icon={<Coins size={18} />} label="Chiffre d'affaires généré" value={fmtFCFA(statsForTotals.ca)} accent />
                <StatCard icon={<Users size={18} />} label="Commission totale" value={fmtFCFA(statsForTotals.commission)} />
              </section>
              <div style={styles.tableWrap}>
                {statsForVentes.length === 0 ? (
                  <div style={styles.emptyState}>Aucune vente enregistrée pour ce commercial.</div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>{["Date", "Article", "Qté", "Commission"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {statsForVentes.map((v) => (
                        <tr key={v.id} style={styles.tr}>
                          <td style={styles.tdMono}>{fmtDate(v.date)}</td>
                          <td style={styles.tdName}>{v.itemNom}</td>
                          <td style={styles.td}>{v.quantite}</td>
                          <td style={styles.tdMono}>{fmtFCFA(v.quantite * v.commissionUnitaire)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {bilanOpen && (
        <div style={styles.overlay} onClick={() => setBilanOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Bilan entreprise</h2>
              <button style={styles.closeBtn} onClick={() => setBilanOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={styles.checkRow}>
                {SECTEURS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    style={{ ...styles.checkChip, ...(bilanSecteur === s ? styles.checkChipActive : {}) }}
                    onClick={() => setBilanSecteur(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p style={styles.bilanNote}>
                Secteur « {bilanSecteur} » uniquement — aucun chiffre n'est partagé avec les 2 autres secteurs.
              </p>

              <div style={{ ...styles.customDateRow, marginTop: 10 }}>
                <Field label="Période">
                  <select style={styles.input} value={bilanPeriod} onChange={(e) => setBilanPeriod(e.target.value)}>
                    <option value="week">7 derniers jours</option>
                    <option value="month">Ce mois-ci</option>
                    <option value="custom">Personnalisée</option>
                    <option value="all">Toute la période</option>
                  </select>
                </Field>
              </div>
              {bilanPeriod === "custom" && (
                <div style={styles.customDateRow}>
                  <Field label="Du">
                    <input style={styles.input} type="date" value={bilanCustomFrom} onChange={(e) => setBilanCustomFrom(e.target.value)} />
                  </Field>
                  <Field label="Au">
                    <input style={styles.input} type="date" value={bilanCustomTo} onChange={(e) => setBilanCustomTo(e.target.value)} />
                  </Field>
                </div>
              )}

              <p style={styles.bilanNote}>Cumule Yaoundé et Douala pour la période sélectionnée. Un boîtier correspond à chaque paire vendue.</p>

              <section style={{ ...styles.statsRow, marginTop: 6 }}>
                <StatCard icon={<PackageCheck size={18} />} label="Paires / boîtiers vendus" value={bilan.boitiers} />
                <StatCard icon={<Coins size={18} />} label="Chiffre d'affaires" value={fmtFCFA(bilan.ca)} accent />
                <StatCard icon={<Glasses size={18} />} label="Coût d'achat total" value={fmtFCFA(bilan.achat)} />
                <StatCard icon={<PackageCheck size={18} />} label="Coût boîtiers total" value={fmtFCFA(bilan.boitierCout)} />
                <StatCard icon={<Users size={18} />} label="Commissions versées" value={fmtFCFA(bilan.commissions)} />
                <StatCard icon={<ArrowLeftRight size={18} />} label="Livraison + expédition" value={fmtFCFA(bilan.frais)} />
              </section>

              <div style={styles.bilanTotalCard}>
                <div style={styles.bilanTotalLabel}>Bénéfice généré — secteur {bilanSecteur}</div>
                <div style={styles.bilanTotalValue}>{fmtFCFA(bilan.benefice)}</div>
              </div>

              {pertesLivraisonRatee > 0 && (
                <p style={styles.bilanNote}>
                  Note : {fmtFCFA(pertesLivraisonRatee)} de pertes liées à des livraisons ratées sur la période ({bilanEchecs.length}),
                  non rattachées à un secteur précis et donc non déduites ci-dessus. Visible dans l'onglet Ventes.
                </p>
              )}

              <h3 style={styles.bilanSectionTitle}>Comparateur de mois</h3>
              <p style={styles.bilanNote}>Secteur {bilanSecteur}, toujours sur les 12 derniers mois, indépendamment de la période choisie ci-dessus.</p>
              {monthlyComparison.length === 0 ? (
                <div style={styles.emptyState}>Pas encore assez de ventes pour comparer les mois.</div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>{["Mois", "Paires vendues", "CA"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {monthlyComparison.map((m) => (
                        <tr key={m.key} style={styles.tr}>
                          <td style={styles.tdName}>
                            {m.label}
                            {bestMonth && m.key === bestMonth.key && <span style={styles.bestTag}>Meilleur mois</span>}
                            {worstMonth && m.key === worstMonth.key && monthlyComparison.length > 1 && (
                              <span style={styles.worstTag}>Mois le plus faible</span>
                            )}
                          </td>
                          <td style={styles.td}>{m.paires}</td>
                          <td style={styles.tdMono}>{fmtFCFA(m.ca)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 style={styles.bilanSectionTitle}>Modèles les plus / moins commandés</h3>
              <p style={styles.bilanNote}>Secteur {bilanSecteur}, sur la période sélectionnée ci-dessus.</p>
              {modelRanking.length === 0 ? (
                <div style={styles.emptyState}>Aucune vente sur cette période.</div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>{["Modèle", "Paires vendues", "CA"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {modelRanking.map((m, idx) => (
                        <tr key={m.nom} style={styles.tr}>
                          <td style={styles.tdName}>
                            {m.nom}
                            {idx === 0 && <span style={styles.bestTag}>Le plus commandé</span>}
                            {idx === modelRanking.length - 1 && modelRanking.length > 1 && (
                              <span style={styles.worstTag}>Le moins commandé</span>
                            )}
                          </td>
                          <td style={styles.td}>{m.paires}</td>
                          <td style={styles.tdMono}>{fmtFCFA(m.ca)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 style={styles.bilanSectionTitle}>Commerciaux les plus / moins performants</h3>
              <p style={styles.bilanNote}>Secteur {bilanSecteur}, sur la période sélectionnée ci-dessus.</p>
              {sellerRanking.length === 0 ? (
                <div style={styles.emptyState}>Aucune vente sur cette période.</div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>{["Commercial", "Paires vendues", "Commission"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sellerRanking.map((s, idx) => (
                        <tr key={s.nom} style={styles.tr}>
                          <td style={styles.tdName}>
                            {s.nom}
                            {idx === 0 && <span style={styles.bestTag}>Le plus performant</span>}
                            {idx === sellerRanking.length - 1 && sellerRanking.length > 1 && (
                              <span style={styles.worstTag}>Le moins performant</span>
                            )}
                          </td>
                          <td style={styles.td}>{s.paires}</td>
                          <td style={styles.tdMono}>{fmtFCFA(s.commission)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockTab({
  stats, query, setQuery, categoryFilter, setCategoryFilter, filtered, villeItems, ville,
  openAddItem, openEditItem, setTransferItem, confirmDeleteId, setConfirmDeleteId, removeItem, setLightboxPhoto,
}) {
  return (
    <>
      <div style={styles.tabHeaderRow}>
        <button style={styles.addBtn} onClick={openAddItem}>
          <Plus size={16} strokeWidth={2.5} /> Ajouter un article
        </button>
      </div>
      <section style={styles.statsRow}>
        <StatCard icon={<Glasses size={18} />} label="Références" value={stats.refs} />
        <StatCard icon={<PackageCheck size={18} />} label="Unités en stock" value={stats.unites} />
        <StatCard icon={<Coins size={18} />} label="Valeur du stock" value={fmtFCFA(stats.valeur)} accent />
        <StatCard icon={<TriangleAlert size={18} />} label="Alertes stock bas" value={stats.alertes} warn={stats.alertes > 0} />
      </section>
      <section style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} color="#a37b8c" />
          <input style={styles.searchInput} placeholder="Rechercher un modèle, une référence, une couleur…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div style={styles.chipsRow}>
          {["Toutes", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} style={{ ...styles.chip, ...(categoryFilter === c ? styles.chipActive : {}) }}>{c}</button>
          ))}
        </div>
      </section>
      <section style={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            {villeItems.length === 0 ? `Aucun article à ${ville} pour l'instant.` : "Aucun article ne correspond à cette recherche."}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>{["", "Réf.", "Modèle", "Catégorie", "Couleur", "Qté", "Achat", "Vente", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const low = it.quantite <= it.seuil;
                return (
                  <tr key={it.id} style={styles.tr}>
                    <td style={styles.tdPhoto}>
                      {it.photo ? (
                        <img src={it.photo} alt={it.nom} style={styles.thumb} onClick={() => setLightboxPhoto(it.photo)} />
                      ) : (
                        <div style={styles.thumbPlaceholder}><Glasses size={15} color="#a37b8c" /></div>
                      )}
                    </td>
                    <td style={styles.tdMono}>{it.reference || "—"}</td>
                    <td style={styles.tdName}>{it.nom}</td>
                    <td style={styles.td}><span style={styles.catTag}>{it.categorie}</span></td>
                    <td style={styles.td}>{it.couleur || "—"}</td>
                    <td style={styles.td}><span style={{ ...styles.qtyTag, ...(low ? styles.qtyTagLow : {}) }}>{it.quantite}</span></td>
                    <td style={styles.tdMono}>{fmtFCFA(it.prixAchat)}</td>
                    <td style={styles.tdMono}>{fmtFCFA(it.prixVente)}</td>
                    <td style={styles.tdActions}>
                      <button style={styles.iconBtn} onClick={() => setTransferItem(it)} title="Transférer"><ArrowLeftRight size={15} /></button>
                      <button style={styles.iconBtn} onClick={() => openEditItem(it)} title="Modifier"><Pencil size={15} /></button>
                      {confirmDeleteId === it.id ? (
                        <span style={styles.confirmRow}>
                          <button style={styles.confirmYes} onClick={() => removeItem(it.id)}>Confirmer</button>
                          <button style={styles.confirmNo} onClick={() => setConfirmDeleteId(null)}>Annuler</button>
                        </span>
                      ) : (
                        <button style={styles.iconBtn} onClick={() => setConfirmDeleteId(it.id)} title="Supprimer"><Trash2 size={15} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function VentesTab({
  ville, stats, ventes, openSale, sellableCount, venteQuery, setVenteQuery,
  openEditVente, confirmDeleteVenteId, setConfirmDeleteVenteId, cancelVente,
  openEchec, villeEchecs, echecsPertesTotal, removeEchec,
}) {
  return (
    <>
      <div style={styles.tabHeaderRow}>
        <button style={styles.addBtn} onClick={openSale} disabled={sellableCount === 0}>
          <Plus size={16} strokeWidth={2.5} /> Enregistrer une vente
        </button>
        <button style={styles.echecBtn} onClick={openEchec}>
          <TriangleAlert size={16} strokeWidth={2.5} /> Livraison échouée
        </button>
        {sellableCount === 0 && <span style={styles.hintText}>Aucun article disponible à {ville}.</span>}
      </div>
      <section style={styles.statsRow}>
        <StatCard icon={<ShoppingBag size={18} />} label="Paires vendues" value={stats.paires} />
        <StatCard icon={<Coins size={18} />} label="Chiffre d'affaires" value={fmtFCFA(stats.ca)} accent />
        <StatCard icon={<Users size={18} />} label="Commissions versées" value={fmtFCFA(stats.commissions)} />
        <StatCard icon={<TrendingUp size={18} />} label="Bénéfice net entreprise" value={fmtFCFA(stats.benefice)} accent />
      </section>

      {villeEchecs.length > 0 && (
        <>
          <h3 style={styles.bilanSectionTitle}>Livraisons échouées ({villeEchecs.length}) — {fmtFCFA(echecsPertesTotal)} perdus</h3>
          <section style={{ ...styles.tableWrap, marginBottom: 16 }}>
            <table style={styles.table}>
              <thead>
                <tr>{["Date", "Commercial", "Montant", "Note", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {villeEchecs.map((x) => (
                  <tr key={x.id} style={styles.tr}>
                    <td style={styles.tdMono}>{fmtDate(x.date)}</td>
                    <td style={styles.td}>{x.commercialNom}</td>
                    <td style={styles.tdMono}>{fmtFCFA(x.montant)}</td>
                    <td style={styles.td}>{x.note || "—"}</td>
                    <td style={styles.tdActions}>
                      <button style={styles.iconBtn} onClick={() => removeEchec(x.id)} title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
      <div style={styles.searchWrap}>
        <Search size={16} color="#a37b8c" />
        <input
          style={styles.searchInput}
          placeholder="Rechercher par article, commercial, quartier…"
          value={venteQuery}
          onChange={(e) => setVenteQuery(e.target.value)}
        />
      </div>
      <section style={{ ...styles.tableWrap, marginTop: 14 }}>
        {ventes.length === 0 ? (
          <div style={styles.emptyState}>Aucune vente ne correspond à {ville}.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>{["", "Date", "Article", "Commercial", "Qté", "Quartier", "CA", "Commission", "Frais", "Bénéfice", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {ventes.map((v) => {
                const ca = v.quantite * v.prixVenteUnitaire;
                const frais = v.livraisonUnitaire + v.expeditionUnitaire;
                const benefice =
                  ca - v.quantite * (v.prixAchatUnitaire + v.boitierUnitaire + v.commissionUnitaire) - frais;
                return (
                  <tr key={v.id} style={styles.tr}>
                    <td style={styles.tdPhoto}>
                      {v.itemPhoto ? (
                        <img src={v.itemPhoto} alt={v.itemNom} style={styles.thumb} />
                      ) : (
                        <div style={styles.thumbPlaceholder}><Glasses size={15} color="#a37b8c" /></div>
                      )}
                    </td>
                    <td style={styles.tdMono}>{fmtDate(v.date)}</td>
                    <td style={styles.tdName}>{v.itemNom}</td>
                    <td style={styles.td}>{v.commercialNom}</td>
                    <td style={styles.td}>{v.quantite}</td>
                    <td style={styles.td}>{v.quartier || "—"}</td>
                    <td style={styles.tdMono}>{fmtFCFA(ca)}</td>
                    <td style={styles.tdMono}>{fmtFCFA(v.quantite * v.commissionUnitaire)}</td>
                    <td style={styles.tdMono}>
                      {fmtFCFA(frais)} <span style={styles.freightTag}>{v.livraisonUnitaire ? "livr." : "exp."}</span>
                    </td>
                    <td style={styles.tdMono}>{fmtFCFA(benefice)}</td>
                    <td style={styles.tdActions}>
                      <button style={styles.iconBtn} onClick={() => openEditVente(v)} title="Modifier">
                        <Pencil size={15} />
                      </button>
                      {confirmDeleteVenteId === v.id ? (
                        <span style={styles.confirmRow}>
                          <button style={styles.confirmYes} onClick={() => cancelVente(v)}>Confirmer</button>
                          <button style={styles.confirmNo} onClick={() => setConfirmDeleteVenteId(null)}>Annuler</button>
                        </span>
                      ) : (
                        <button style={styles.iconBtn} onClick={() => setConfirmDeleteVenteId(v.id)} title="Annuler la vente">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function CommerciauxTab({ commerciaux, ventes, openAdd, confirmDeleteCommId, setConfirmDeleteCommId, removeCommercial, openPayslip, openStats, openEditCommercial }) {
  const rows = commerciaux.map((c) => {
    const cv = ventes.filter((v) => v.commercialId === c.id);
    const paires = cv.reduce((a, v) => a + v.quantite, 0);
    const commissionTotale = cv.reduce((a, v) => a + v.quantite * v.commissionUnitaire, 0);
    return { ...c, paires, commissionTotale };
  });
  return (
    <>
      <div style={styles.tabHeaderRow}>
        <button style={styles.addBtn} onClick={openAdd}><Plus size={16} strokeWidth={2.5} /> Ajouter un commercial</button>
      </div>
      {rows.length === 0 ? (
        <div style={styles.emptyState}>Aucun commercial pour l'instant.</div>
      ) : (
        <div style={styles.commGrid}>
          {rows.map((c) => (
            <div key={c.id} style={styles.commCard}>
              <div style={styles.commHeader}>
                <div>
                  <div style={styles.commName}>{c.nom}</div>
                  <button style={styles.commRateBtn} onClick={() => openEditCommercial(c)}>
                    {fmtFCFA(c.commission)} / paire <Pencil size={11} />
                  </button>
                </div>
                {confirmDeleteCommId === c.id ? (
                  <span style={styles.confirmRow}>
                    <button style={styles.confirmYes} onClick={() => removeCommercial(c.id)}>Confirmer</button>
                    <button style={styles.confirmNo} onClick={() => setConfirmDeleteCommId(null)}>Annuler</button>
                  </span>
                ) : (
                  <button style={styles.iconBtn} onClick={() => setConfirmDeleteCommId(c.id)}><Trash2 size={15} /></button>
                )}
              </div>
              <div style={styles.commStatsRow}>
                <div><div style={styles.commStatVal}>{c.paires}</div><div style={styles.commStatLabel}>paires vendues</div></div>
                <div><div style={styles.commStatVal}>{fmtFCFA(c.commissionTotale)}</div><div style={styles.commStatLabel}>commission totale</div></div>
              </div>
              <div style={styles.commBtnRow}>
                <button style={styles.statsBtn} onClick={() => openStats(c)}>
                  <TrendingUp size={14} /> Statistiques
                </button>
                <button style={styles.payslipBtn} onClick={() => openPayslip(c)}>
                  <ReceiptText size={14} /> Fiche de paie
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MouvementsTab({ mouvements }) {
  const typeLabel = { ajout: "Ajout", modification: "Modification", vente: "Vente", transfert: "Transfert", suppression: "Suppression" };
  return (
    <section style={styles.tableWrap}>
      {mouvements.length === 0 ? (
        <div style={styles.emptyState}>Aucun mouvement enregistré.</div>
      ) : (
        <div>
          {mouvements.map((m) => (
            <div key={m.id} style={styles.mvRow}>
              <span style={{ ...styles.mvTag, ...(styles["mvTag_" + m.type] || {}) }}>{typeLabel[m.type] || m.type}</span>
              <span style={styles.mvDetail}>{m.detail}</span>
              <span style={styles.mvDate}>{fmtDateTime(m.date)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({ icon, label, value, accent, warn }) {
  return (
    <div style={{ ...styles.statCard, ...(warn ? styles.statCardWarn : {}) }}>
      <div style={{ ...styles.statIcon, ...(accent ? styles.statIconAccent : {}), ...(warn ? styles.statIconWarn : {}) }}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

const fontImports = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap');
`;

const rose = "#e0578f";
const roseDeep = "#b8306a";
const roseSoft = "#f5c9dc";
const bg = "#180f16";
const surface = "#221621";
const border = "#3a2436";
const textPrimary = "#f6ecf1";
const textMuted = "#a37b8c";

const styles = {
  page: { minHeight: "100vh", background: `radial-gradient(circle at 20% 0%, #2a1826 0%, ${bg} 45%)`, color: textPrimary, fontFamily: "'Inter', sans-serif", padding: "24px 18px 60px", boxSizing: "border-box" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 },
  brandRow: { display: "flex", alignItems: "center", gap: 14 },
  lensMark: { width: 42, height: 42, borderRadius: "50%", border: `2px solid ${rose}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 0 4px ${rose}22` },
  lensMarkInner: { width: 15, height: 15, borderRadius: "50%", background: `linear-gradient(135deg, ${rose}, ${roseSoft})` },
  brandName: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 0.3 },
  brandSub: { margin: 0, fontSize: 12, color: textMuted, letterSpacing: 1, textTransform: "uppercase" },
  iconOnlyBtn: { background: surface, border: `1px solid ${border}`, color: textMuted, borderRadius: 10, padding: 10, cursor: "pointer" },
  bilanHeaderBtn: { display: "flex", alignItems: "center", gap: 6, background: `linear-gradient(135deg, ${rose}, ${roseDeep})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  lowStockBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#8a3a4a2a",
    border: "1px solid #c95a6f",
    color: "#f5c9d4",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 12.5,
    marginBottom: 16,
    cursor: "pointer",
    lineHeight: 1.5,
  },
  mainTabs: { display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 },
  mainTab: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${border}`, color: textMuted, borderRadius: 10, padding: "8px 13px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" },
  mainTabActive: { background: `${rose}20`, borderColor: rose, color: "#fff" },
  cityTabs: { display: "flex", gap: 10, marginBottom: 18 },
  cityTab: { display: "flex", alignItems: "center", gap: 7, background: surface, border: `1px solid ${border}`, color: textMuted, borderRadius: 10, padding: "9px 15px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  cityTabActive: { background: `${rose}20`, borderColor: rose, color: "#fff" },
  tabHeaderRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  hintText: { fontSize: 12.5, color: textMuted },
  addBtn: { display: "flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg, ${rose}, ${roseDeep})`, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  echecBtn: { display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid #c95a6f", color: "#f5c9d4", borderRadius: 10, padding: "11px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 22 },
  statCard: { display: "flex", alignItems: "center", gap: 12, background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 16px" },
  statCardWarn: { borderColor: "#8a3a4a" },
  statIcon: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#3a2436", color: roseSoft, flexShrink: 0 },
  statIconAccent: { background: `${rose}22`, color: rose },
  statIconWarn: { background: "#8a3a4a33", color: "#f0a3b8" },
  statValue: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: textMuted, marginTop: 2 },
  toolbar: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 18 },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: "9px 14px", flex: "1 1 260px" },
  searchInput: { background: "transparent", border: "none", outline: "none", color: textPrimary, fontSize: 13.5, width: "100%", fontFamily: "'Inter', sans-serif" },
  chipsRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: { background: "transparent", border: `1px solid ${border}`, color: textMuted, borderRadius: 20, padding: "7px 13px", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  chipActive: { background: `${rose}1f`, borderColor: rose, color: roseSoft },
  tableWrap: { background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: textMuted, padding: "13px 14px", borderBottom: `1px solid ${border}`, fontWeight: 600, whiteSpace: "nowrap" },
  tr: { borderBottom: `1px solid ${border}` },
  td: { padding: "13px 14px", fontSize: 13.5, verticalAlign: "middle" },
  tdName: { padding: "13px 14px", fontSize: 13.5, fontWeight: 500 },
  tdPhoto: { padding: "10px 0 10px 14px" },
  thumb: { width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: `1px solid ${border}`, cursor: "pointer", display: "block" },
  thumbPlaceholder: { width: 40, height: 40, borderRadius: 8, background: "#2a1a26", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" },
  tdMono: { padding: "13px 14px", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", color: "#e3c3d2", whiteSpace: "nowrap" },
  tdActions: { padding: "10px 14px", whiteSpace: "nowrap", textAlign: "right" },
  catTag: { fontSize: 11.5, color: roseSoft, background: "#3a2436", padding: "4px 9px", borderRadius: 8, whiteSpace: "nowrap" },
  qtyTag: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, background: "#3a2436", padding: "3px 10px", borderRadius: 20 },
  qtyTagLow: { background: "#8a3a4a33", color: "#f0a3b8" },
  iconBtn: { background: "transparent", border: "none", color: textMuted, cursor: "pointer", padding: 6, borderRadius: 6 },
  confirmRow: { display: "inline-flex", gap: 6, alignItems: "center" },
  confirmYes: { background: "#8a2a4a", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", fontSize: 11.5, cursor: "pointer" },
  confirmNo: { background: "transparent", color: textMuted, border: `1px solid ${border}`, borderRadius: 6, padding: "5px 9px", fontSize: 11.5, cursor: "pointer" },
  emptyState: { padding: "50px 20px", textAlign: "center", color: textMuted, fontSize: 13.5 },
  saveError: { marginTop: 14, fontSize: 12.5, color: "#f0a3b8", textAlign: "center" },
  errorText: { fontSize: 12.5, color: "#f0a3b8", margin: 0 },
  checkRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  lignesWrap: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 },
  ligneCard: { border: `1px solid ${border}`, borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 8 },
  ligneRow: { display: "flex", gap: 8, alignItems: "center" },
  ligneThumb: { width: 34, height: 34, borderRadius: 7, objectFit: "cover", flexShrink: 0, border: `1px solid ${border}` },
  ligneThumbPlaceholder: { width: 34, height: 34, borderRadius: 7, background: "#2a1a26", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  lignePriceRow: { display: "flex", alignItems: "center", gap: 8, paddingLeft: 42 },
  lignePriceLabel: { fontSize: 11, color: textMuted, flex: 1 },
  ligneOriginalPrice: { fontSize: 10.5, color: "#e8a06f" },
  removeLigneBtn: { background: "transparent", border: `1px solid ${border}`, color: textMuted, borderRadius: 8, padding: 8, cursor: "pointer", flexShrink: 0 },
  addLigneBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px dashed ${rose}`, color: roseSoft, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif", width: "fit-content" },
  checkChip: { background: "#150d13", border: `1px solid ${border}`, color: textMuted, borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" },
  checkChipActive: { background: `${rose}25`, borderColor: rose, color: "#fff" },
  livePreview: { fontSize: 12.5, color: roseSoft, background: "#3a243620", border: `1px solid ${border}`, borderRadius: 8, padding: "9px 12px" },
  freightTag: { fontSize: 10, color: textMuted },
  overlay: { position: "fixed", inset: 0, background: "#0a060acc", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50, overflowY: "auto" },
  modal: { background: surface, border: `1px solid ${border}`, borderRadius: 16, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" },
  confirmModal: { background: surface, border: `1px solid ${border}`, borderRadius: 16, width: "100%", maxWidth: 380, padding: 20, maxHeight: "90vh", overflowY: "auto" },
  transferText: { fontSize: 13.5, color: textPrimary, lineHeight: 1.5 },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${border}` },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0 },
  closeBtn: { background: "transparent", border: "none", color: textMuted, cursor: "pointer" },
  form: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  photoRow: { display: "flex", alignItems: "center", gap: 14 },
  photoPreviewWrap: { cursor: "pointer", flexShrink: 0 },
  photoPreview: { width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: `1px solid ${border}` },
  photoPlaceholder: { width: 64, height: 64, borderRadius: 12, background: "#2a1a26", border: `1px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center" },
  photoBtn: { background: "transparent", border: `1px solid ${rose}`, color: roseSoft, borderRadius: 8, padding: "7px 13px", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  photoHint: { fontSize: 11.5, color: textMuted, margin: "6px 0 0" },
  saveQuartierBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: `1px dashed ${rose}`,
    color: roseSoft,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    marginTop: 8,
    textAlign: "left",
  },
  quartierWrap: { position: "relative" },
  quartierDropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#150d13",
    border: `1px solid ${border}`,
    borderRadius: 10,
    maxHeight: 220,
    overflowY: "auto",
    zIndex: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  quartierOption: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${border}`,
    color: textPrimary,
    padding: "10px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    textAlign: "left",
  },
  quartierOptionTarif: { color: textMuted, fontSize: 11.5, fontFamily: "'Space Grotesk', sans-serif" },
  quartierNoMatch: { padding: "12px", fontSize: 12, color: textMuted, display: "flex", flexDirection: "column", gap: 6 },
  formRow: { display: "flex", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  fieldLabel: { fontSize: 12, color: textMuted },
  input: { background: "#150d13", border: `1px solid ${border}`, borderRadius: 8, padding: "9px 11px", color: textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", outline: "none" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  cancelBtn: { background: "transparent", border: `1px solid ${border}`, color: textMuted, borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" },
  saveBtn: { background: `linear-gradient(135deg, ${rose}, ${roseDeep})`, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  lightboxImg: { maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, border: `2px solid ${rose}` },

  commGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  commCard: { background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 16 },
  commHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  commName: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 },
  commVille: { display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: textMuted, marginTop: 3 },
  commRateBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: roseSoft, fontSize: 11.5, padding: 0, marginTop: 3, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  commStatsRow: { display: "flex", gap: 22, marginBottom: 14 },
  commStatVal: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600 },
  commStatLabel: { fontSize: 10.5, color: textMuted, marginTop: 2 },
  payslipBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1, background: "transparent", border: `1px solid ${rose}`, color: roseSoft, borderRadius: 8, padding: "9px 0", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  commBtnRow: { display: "flex", gap: 8 },
  statsBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1, background: "#3a2436", border: `1px solid ${border}`, color: textPrimary, borderRadius: 8, padding: "9px 0", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif" },

  mvRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${border}`, fontSize: 13 },
  mvTag: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, padding: "3px 8px", borderRadius: 6, background: "#3a2436", color: roseSoft, flexShrink: 0 },
  mvTag_vente: { background: `${rose}22`, color: rose },
  mvTag_suppression: { background: "#8a3a4a33", color: "#f0a3b8" },
  mvDetail: { flex: 1, color: textPrimary },
  mvDate: { fontSize: 11.5, color: textMuted, whiteSpace: "nowrap" },

  periodSelect: { background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 8, padding: "8px 11px", fontSize: 12.5, fontFamily: "'Inter', sans-serif" },
  payslipWrap: { width: "100%", maxWidth: 560 },
  payslipTopBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  printBtn: { display: "flex", alignItems: "center", gap: 6, background: rose, color: "#fff", border: "none", borderRadius: 8, padding: "8px 13px", fontSize: 12.5, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  closeBtnDark: { background: surface, border: `1px solid ${border}`, color: textMuted, borderRadius: 8, padding: 8, cursor: "pointer" },
  payslipPaper: { background: "#fffaf9", color: "#241018", borderRadius: 10, padding: "28px 26px", maxHeight: "78vh", overflowY: "auto" },
  payslipHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${rose}`, paddingBottom: 14, marginBottom: 18, gap: 12, flexWrap: "wrap" },
  payslipBrand: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: roseDeep },
  payslipSub: { fontSize: 11.5, color: "#8a6070", textTransform: "uppercase", letterSpacing: 1 },
  payslipMeta: { fontSize: 12, lineHeight: 1.7, color: "#3a2430", textAlign: "right" },
  payslipTable: { width: "100%", borderCollapse: "collapse", marginBottom: 16 },
  payslipTh: { textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, color: "#8a6070", padding: "8px 6px", borderBottom: "1px solid #e3c3d2" },
  payslipTd: { padding: "8px 6px", fontSize: 12.5, borderBottom: "1px solid #f0dde5" },
  payslipEmptyRow: { padding: "16px 6px", fontSize: 12.5, color: "#8a6070", textAlign: "center" },
  payslipTotalsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: `2px solid ${rose}`, fontSize: 13 },
  payslipSubtotals: { fontSize: 12.5, color: "#5a3a48", lineHeight: 1.9, paddingTop: 6 },
  customDateRow: { display: "flex", gap: 10, marginBottom: 10 },
  boostRow: { marginBottom: 14 },
  bilanNote: { fontSize: 12, color: textMuted, margin: "0 0 14px" },
  bilanSectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, margin: "24px 0 4px", color: textPrimary },
  bestTag: { fontSize: 10, marginLeft: 8, color: "#7ee0a8", background: "#2a4a3a", padding: "2px 7px", borderRadius: 6 },
  worstTag: { fontSize: 10, marginLeft: 8, color: "#f0a3b8", background: "#4a2a36", padding: "2px 7px", borderRadius: 6 },
  bilanTotalCard: {
    marginTop: 8,
    background: `linear-gradient(135deg, ${rose}22, ${roseDeep}22)`,
    border: `1px solid ${rose}`,
    borderRadius: 14,
    padding: "18px 20px",
    textAlign: "center",
  },
  bilanTotalLabel: { fontSize: 12.5, color: roseSoft, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  bilanTotalValue: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#fff" },
  bilanTotalSub: { fontSize: 11.5, color: roseSoft, marginTop: 4 },
  payslipGrandTotal: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: roseDeep },
  payslipFooter: { display: "flex", justifyContent: "space-between", gap: 20, marginTop: 40 },
  signatureBox: { flex: 1, borderTop: "1px solid #8a6070", paddingTop: 6, fontSize: 11, color: "#8a6070", textAlign: "center" },
};
