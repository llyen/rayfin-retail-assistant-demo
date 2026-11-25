import { createDoc, listDocs } from './knowledge';

interface SeedEntry {
  title: string;
  body: string;
  tags: string;
  audience: string;
  region: string;
}

const SEED: SeedEntry[] = [
  {
    title: 'Wniosek urlopowy, procedura',
    body: `Wniosek urlopowy składasz w portalu pracowniczym co najmniej 14 dni przed planowanym terminem.
Krok 1: Zaloguj się do portalu pracowniczego i otwórz zakładkę Nieobecności.
Krok 2: Wybierz rodzaj urlopu (wypoczynkowy, na żądanie, okolicznościowy) i daty.
Krok 3: Kierownik zmiany dostaje powiadomienie i ma 3 dni robocze na decyzję.
Krok 4: Po akceptacji urlop pojawia się w grafiku hali.
Nagłą nieobecność (choroba) zgłoś telefonicznie kierownikowi zmiany przed rozpoczęciem zmiany, a zwolnienie lekarskie przekaż w ciągu 7 dni.`,
    tags: 'hr,urlop,portal,nieobecnosc',
    audience: 'all',
    region: 'all',
  },
  {
    title: 'Ekspozycja sezonowa w dziale ogrodowym',
    body: `Wiosenna ekspozycja (nasiona, ziemia, doniczki, narzędzia ręczne) startuje w pierwszy poniedziałek marca.
Paleta z promocją tygodnia stoi przy wejściu do działu ogrodowego, nie w głównej alei.
Ciężkie worki (ziemia, kora, nawozy powyżej 20 kg) układamy wyłącznie na najniższym poziomie regału.
Rośliny żywe podlewa zmiana poranna; karta podlewania wisi przy stole roboczym.
Zdjęcie gotowej ekspozycji wysyła kierownik działu do koordynatora regionu w środę do 12:00.`,
    tags: 'merchandising,ekspozycja,ogrod,sezon',
    audience: 'store',
    region: 'all',
  },
  {
    title: 'Strój roboczy na hali i w strefie składowania',
    body: `Na hali sprzedaży obowiązuje kamizelka firmowa z identyfikatorem.
W strefie składowania i przy wydawaniu towaru wymagane są buty z podnoskiem i rękawice robocze.
Przy cięciu płyt i docinaniu materiałów zakładamy okulary ochronne; leżą przy stanowisku cięcia.
Odzież robocza jest wydawana przy przyjęciu do pracy i wymieniana raz w roku albo po zniszczeniu.`,
    tags: 'hr,bhp,stroj,onboarding',
    audience: 'store',
    region: 'all',
  },
  {
    title: 'BHP, wypadek na hali lub w strefie składowania',
    body: `1. Zatrzymaj pracę wózka lub maszyny i zabezpiecz miejsce zdarzenia.
2. Udziel pierwszej pomocy (apteczka przy punkcie obsługi klienta, AED przy wejściu głównym).
3. Przy poważnym urazie dzwoń pod 112.
4. Powiadom kierownika zmiany i służbę BHP.
5. Protokół zdarzenia wypełnij w ciągu 24 godzin w portalu pracowniczym.
6. Nagranie z monitoringu zabezpiecza kierownik zmiany.`,
    tags: 'bhp,wypadek,hala,bezpieczenstwo',
    audience: 'all',
    region: 'all',
  },
  {
    title: 'Otwarcie sklepu, lista kontrolna',
    body: `Start 45 minut przed otwarciem dla klientów.
1. Rozbrój alarm swoim kodem.
2. Sprawdź, czy brama strefy odbioru towaru jest zamknięta, a wózki widłowe naładowane.
3. Uruchom kasy i terminale płatnicze.
4. Przejdź główną aleję i usuń palety, które blokują przejścia.
5. Krótka odprawa zespołu: dostawy na dziś, promocje tygodnia, nieobecności.
6. Otwórz drzwi o czasie; spóźnione otwarcie wpisz do dziennika zmiany.`,
    tags: 'sklep,otwarcie,operacje,checklista',
    audience: 'manager',
    region: 'all',
  },
];

export async function seedKnowledgeIfEmpty(): Promise<number> {
  const existing = await listDocs();
  if (existing.length > 0) return 0;
  let count = 0;
  for (const e of SEED) {
    await createDoc(e);
    count++;
  }
  return count;
}
