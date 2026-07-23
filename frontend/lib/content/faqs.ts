export interface FaqItem {
  question: string;
  answer: string;
}

export const LANDING_FAQS: FaqItem[] = [
  {
    question: "Will LastminuteITR submit my return?",
    answer:
      "No. LastminuteITR helps prepare and organise your tax information and guides you through the official Income Tax Portal. You review, submit and e-verify the return yourself.",
  },
  {
    question: "What documents should I keep ready?",
    answer:
      "Most salaried taxpayers can start with Form 16. Depending on your income, you may also need AIS, Form 26AS, bank-interest details, investment proofs, rent or home-loan information and broker statements.",
  },
  {
    question: "Which tax regime should I choose?",
    answer:
      "The better option depends on your income and eligible tax-saving details. LastminuteITR estimates both regimes and shows the difference. You make the final choice.",
  },
  {
    question: "Is my refund guaranteed?",
    answer:
      "No. Any refund shown is an estimate based on the information available. The Income Tax Department determines the final refund or tax payable after processing the return.",
  },
  {
    question: "Is LastminuteITR connected to the Income Tax Department?",
    answer:
      "No. LastminuteITR is independently operated and is not affiliated with, endorsed by or authorised by the Income Tax Department.",
  },
  {
    question: "Can LastminuteITR handle every tax situation?",
    answer:
      "Not yet. Some complex cases may require additional support, especially where foreign assets, business accounts, tax audits, notices or incomplete investment records are involved.",
  },
  {
    question: "What am I paying for?",
    answer:
      "Paid plans provide a detailed filing summary, additional checks and screen-by-screen guidance for completing the return on incometax.gov.in. Features depend on the selected plan.",
  },
];

export const HELP_FAQS: FaqItem[] = [
  {
    question: "How is the Help center organized?",
    answer:
      "Articles follow your companion journey: Prep (documents), Reconcile (AIS/Form 16), Regime, File on portal, and E-verify — not an e-file Save/Pay/File taxonomy.",
  },
  {
    question: "Can LastMinute file my return?",
    answer:
      "No. Help articles explain how to file on incometax.gov.in yourself. We prepare numbers and guide each screen.",
  },
  {
    question: "Where is the ITR form quiz?",
    answer:
      "Visit /tools for a rule-based ITR-1 vs ITR-2 suggestion. It is not a substitute for professional advice on complex cases.",
  },
];

export const HERO_FAQS: FaqItem[] = LANDING_FAQS.slice(0, 4);
