/**
 * BGIN projects & publications — from https://bgin-global.org/projects
 * Used for Knowledge feed, Mage context, and briefing references.
 */

export type BginWorkingGroup = 'ikp' | 'fase' | 'cyber' | 'governance';

export interface BginDocument {
  id: string;
  title: string;
  date: string;
  workingGroup: BginWorkingGroup;
  type: 'publication' | 'meeting_report' | 'project';
  summary: string;
  url?: string;
}

/** All publications and reports from BGIN projects page. */
export const BGIN_PUBLICATIONS: BginDocument[] = [
  {
    id: 'block13-meeting-reports',
    title: 'Block 13 Meeting Reports',
    date: '2025-10-15',
    workingGroup: 'governance',
    type: 'meeting_report',
    summary: 'Comprehensive meeting reports from BGIN Block 13 (October 15-17, 2025), organized by Working Groups with session details and PDFs.',
    url: 'https://bgin-global.org/events/20251015-block13/meeting-reports',
  },
  {
    id: 'wallet-governance',
    title: 'Wallet Governance',
    date: '2025-12-03',
    workingGroup: 'ikp',
    type: 'publication',
    summary: 'Analysis of custodial and non-custodial approaches for key management and wallet governance.',
    url: 'https://docs.google.com/document/d/12bn-bXRaqs0syEX2lX_k-yXWeFlgnh38iv1Onu_Kwuc/edit?usp=drive_link',
  },
  {
    id: 'zkp-application',
    title: 'ZKP and its Application',
    date: '2025-12-03',
    workingGroup: 'ikp',
    type: 'publication',
    summary: 'Zero-knowledge proofs and their applications in identity and privacy-preserving systems.',
    url: 'https://drive.google.com/drive/folders/1wEOhN-tcuWk9RiwrItYS6jRS7Fp_Qi3V?usp=drive_link',
  },
  {
    id: 'layer2-governance',
    title: 'Layer2 Governance',
    date: '2025-12-03',
    workingGroup: 'governance',
    type: 'publication',
    summary: 'Governance frameworks and considerations for Layer 2 blockchain networks.',
    url: 'https://drive.google.com/drive/folders/14nX6N775xMnAg05vFNkeuKgTkLhVRI4f?usp=drive_link',
  },
  {
    id: 'soul-bound-token',
    title: 'Soul Bound Token (SBT)',
    date: '2025-12-03',
    workingGroup: 'ikp',
    type: 'publication',
    summary: 'Study on soulbound tokens and non-transferable identity credentials.',
    url: 'https://drive.google.com/drive/folders/1UqkmJQkgmCA05-w-BP8at4moS79fHcdU?usp=drive_link',
  },
  {
    id: '2020-online-meeting',
    title: '2020 Online Meeting Report',
    date: '2020-06-18',
    workingGroup: 'governance',
    type: 'meeting_report',
    summary: 'BGIN 2020 online meeting report and community outcomes.',
    url: 'https://drive.google.com/drive/u/0/folders/1dKDWefmNVskSNLK8UUEpEYyeXLof2Qr4',
  },
  {
    id: 'decentralized-financial-system',
    title: 'Present and Future of a Decentralized Financial System and the Associated Regulatory Considerations',
    date: '2021-01-01',
    workingGroup: 'fase',
    type: 'publication',
    summary: 'Analysis of decentralized finance and regulatory considerations for the future financial system.',
    url: 'https://drive.google.com/drive/folders/1rD4XHLhDZCVV6si9OvLZ8vhiU-Kqc9Gg?usp=drive_link',
  },
  {
    id: 'ransomware-reaction',
    title: 'Study Report for Ransomware Reaction',
    date: '2022-04-21',
    workingGroup: 'cyber',
    type: 'publication',
    summary: 'Study on ransomware response and mitigation in the blockchain and custody context.',
    url: 'https://drive.google.com/drive/folders/1Rb4Ygxvp6fgd4rdB08mALx7kedrNZWl-?usp=sharing',
  },
  {
    id: 'nft-study-part1',
    title: 'NFT Study Report Part 1: Introduction and Use Cases',
    date: '2022-06-06',
    workingGroup: 'fase',
    type: 'publication',
    summary: 'Introduction to NFTs and their use cases from a governance and market perspective.',
    url: 'https://drive.google.com/drive/folders/1kjmfgpC5tC_4xPCjjnhPXO_Hqa3b14wl?usp=drive_link',
  },
  {
    id: 'incident-response-custody',
    title: 'Incident Response of Decentralized Custody; A Case Study',
    date: '2022-06-06',
    workingGroup: 'cyber',
    type: 'publication',
    summary: 'Case study on incident response for decentralized custody and key management.',
    url: 'https://drive.google.com/drive/folders/1feQ6wU8CfuTdtnkrtiO8Qi2olJpCH2bz?usp=drive_link',
  },
  {
    id: 'sbt-study-part1',
    title: 'Soulbound Tokens (SBTs) Study Report Part 1: Building and Embracing a New Social Identity Layer?',
    date: '2023-02-01',
    workingGroup: 'ikp',
    type: 'publication',
    summary: 'Building and embracing a new social identity layer with soulbound tokens.',
    url: 'https://drive.google.com/drive/folders/1qavS-AxWDc5KP2swGXmiUpr241mYfTMo?usp=drive_link',
  },
  {
    id: 'defi-disclosure-regulation',
    title: 'Proposal of Principles of DeFi Disclosure and Regulation',
    date: '2023-02-13',
    workingGroup: 'fase',
    type: 'publication',
    summary: 'Principles for DeFi disclosure and regulatory alignment.',
    url: 'https://drive.google.com/drive/folders/1BHAOmPlWSi6AEm3FLef9xxtk74gFUggg?usp=sharing',
  },
  {
    id: 'selective-disclosure',
    title: 'Study Report on Selective Disclosure: Overview and Classifications',
    date: '2023-04-28',
    workingGroup: 'ikp',
    type: 'publication',
    summary: 'Overview and classifications of selective disclosure in credentials and privacy.',
    url: 'https://drive.google.com/drive/folders/1PiYadrwKENQ0wtk4SpbMKSPWN4j_O5_C?usp=sharing',
  },
  {
    id: 'stablecoins-defi-failure-points',
    title: 'Potential Points of Failure of Stablecoins and DeFi',
    date: '2023-07-24',
    workingGroup: 'fase',
    type: 'publication',
    summary: 'Identification of potential failure points in stablecoins and DeFi systems.',
    url: 'https://drive.google.com/drive/folders/1uRRCeaC0pwtP5_t_sH9An7JeN-5zYm-1?usp=sharing',
  },
];

/** Projects in progress from BGIN projects page. */
export const BGIN_PROJECTS_IN_PROGRESS: BginDocument[] = [
  {
    id: 'blockchain-analysis-challenges',
    title: 'Blockchain Analysis Challenges',
    workingGroup: 'ikp',
    type: 'project',
    date: '',
    summary: 'Addresses challenges in blockchain analysis: client education, evidence gathering, proactive detection. Topics include FATF compliance for VASPs, role of analytics firms, and impact of privacy tech. Aims to create a comprehensive document for the IKP WG.',
    url: 'https://drive.google.com/drive/folders/1erhESSrRUPT4uuI74m_XMlfyyrKWhOnb',
  },
  {
    id: 'accountable-wallet',
    title: 'Accountable Wallet',
    workingGroup: 'ikp',
    type: 'project',
    date: '',
    summary: 'Design and implement a mechanism for wallet holders to prove they are not involved in illicit activities while preserving privacy. Empowers proactive proof and verification to address compliance issues beyond current regulatory tools.',
    url: 'https://drive.google.com/drive/folders/1wOoJNpeTvJ1VEPoJXgDUZ8ebysn0efWK?usp=drive_link',
  },
  {
    id: 'ai-and-blockchain',
    title: 'AI and Blockchain',
    workingGroup: 'fase',
    type: 'project',
    date: '',
    summary: 'Convergence of blockchain and AI: leveraging blockchain for AI data management and AI for blockchain governance. Weighs positive and negative aspects with real-world use cases.',
    url: 'https://drive.google.com/drive/folders/1-ngWvRGQ_5N36Mr0Pgh119tGIGmCExSu?usp=drive_link',
  },
  {
    id: 'stablecoin-research',
    title: 'Stablecoin Research',
    workingGroup: 'fase',
    type: 'project',
    date: '',
    summary: 'Identifies policy gaps and issues for practitioners and policymakers. Forward-looking perspective on anticipated legal reforms in stablecoins.',
    url: 'https://drive.google.com/drive/u/0/folders/1o9DRR9o_SxfukO7r5kmSvA_IlqD94Z9Z',
  },
  {
    id: 'cyber-security-standards',
    title: 'Cyber Security Standards',
    workingGroup: 'cyber',
    type: 'project',
    date: '',
    summary: 'Establishing industry-wide alignment on cybersecurity information sharing in the crypto industry. Explores a robust international information-sharing framework, drawing lessons from traditional finance.',
    url: 'https://drive.google.com/drive/folders/1UFTRJsSyhKqRelAnet86UsTH1si53Sia?usp=drive_link',
  },
];

export const BGIN_DOCUMENTS_ALL: BginDocument[] = [
  ...BGIN_PUBLICATIONS,
  ...BGIN_PROJECTS_IN_PROGRESS,
];

export const BGIN_PROJECTS_URL = 'https://bgin-global.org/projects';

export function getDocumentsByWorkingGroup(wg: BginWorkingGroup): BginDocument[] {
  return BGIN_DOCUMENTS_ALL.filter((d) => d.workingGroup === wg);
}

export function getDocumentById(id: string): BginDocument | undefined {
  return BGIN_DOCUMENTS_ALL.find((d) => d.id === id);
}
