// dashboardData.js
// Mock data for the ATSYNC Dashboard to separate data from UI logic.

export const initialClients = [
  {
    id: 'quantum-logic',
    name: 'Quantum Logic',
    type: 'active',
    statusDot: 'yellow',
    alertDesc: 'Awaiting response on timeline request',
    alertBadge: 'urgent',
    sentiment: 85,
    sentimentLabel: 'Cautious',
    sentimentColor: 'yellow',
    progress: 62,
    priorityAction: 'Review resource allocation for staggered testing schedule.',
    budget: '$12,000',
    deadline: 'Aug 30',
    service: 'UI + Testing',
    briefLocked: true,
    scopeCreepLog: [
      { id: 1, desc: 'Mobile breakpoints added after brief lock', date: 'Jun 17', status: 'Flagged' }
    ],
    tasks: [
      { id: 1, text: 'Finalize V2 wireframes', completed: false, hours: 8, remaining: 8 },
      { id: 2, text: 'Draft testing protocol', completed: false, hours: 4, remaining: 2 },
      { id: 3, text: 'Send wireframe V2', completed: true, hours: 2, remaining: 0 }
    ],
    timeline: [
      { id: 1, date: 'Jun 1 – Jun 14', title: 'Phase 1 — Discovery', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'Jun 15 – Jul 5', title: 'Phase 2 — Design', status: '62%', progress: 62, active: true },
      { id: 3, date: 'Jul 6 – Jul 20', title: 'Phase 3 — Testing', status: 'Pending', progress: 0, active: false }
    ],
    chatLog: [
      { id: 1, sender: 'client', senderName: 'SARAH J.', avatar: 'SJ', text: "The latest wireframes look solid. The executive team is asking if we can accelerate the timeline for user testing. What's the impact if we pull it in by a week?", time: '10:42 AM' },
      { id: 2, sender: 'agency', senderName: 'YOU', avatar: 'DZ', text: 'Understood. Reviewing resource allocation now — we might be able to do a staggered approach. Let me run the numbers.', time: '11:05 AM' }
    ]
  },
  {
    id: 'apex-ventures',
    name: 'Apex Ventures',
    type: 'active',
    statusDot: 'green',
    alertDesc: 'Brief approved – phase 2 ready',
    alertBadge: 'ready',
    sentiment: 94,
    sentimentLabel: 'Great',
    sentimentColor: 'green',
    progress: 45,
    priorityAction: 'Initiate Phase 2 layout wireframes and user journeys review.',
    budget: '$8,500',
    deadline: 'Sep 15',
    service: 'Branding + UI',
    briefLocked: false,
    scopeCreepLog: [
      { id: 1, desc: 'Copy changes post-approval', date: 'Jun 9', status: 'Resolved' }
    ],
    tasks: [
      { id: 1, text: 'Kickoff meeting for phase 2 layout', completed: true, hours: 4, remaining: 0 },
      { id: 2, text: 'Drafting brand guidelines document', completed: false, hours: 8, remaining: 8 },
      { id: 3, text: 'Create logo options', completed: false, hours: 6, remaining: 4 }
    ],
    timeline: [
      { id: 1, date: 'Jul 1 – Jul 15', title: 'Phase 1 — Discovery', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'Jul 16 – Aug 5', title: 'Phase 2 — Design', status: '45%', progress: 45, active: true },
      { id: 3, date: 'Aug 6 – Aug 20', title: 'Phase 3 — Testing', status: 'Pending', progress: 0, active: false }
    ],
    chatLog: [
      { id: 1, sender: 'client', senderName: 'MARK T.', avatar: 'MT', text: 'Looking forward to the branding presentation next week. We really want to make sure the primary colors align with our eco-friendly goals.', time: '09:15 AM' },
      { id: 2, sender: 'agency', senderName: 'YOU', avatar: 'DZ', text: 'Absolutely Mark, we have prepared three distinct nature-inspired color systems for your team to choose from.', time: '10:00 AM' }
    ]
  },
  {
    id: 'nexus-core',
    name: 'Nexus Core',
    type: 'active',
    statusDot: 'red',
    alertDesc: 'No reply in 4 days',
    alertBadge: 'overdue',
    sentiment: 32,
    sentimentLabel: 'Risk',
    sentimentColor: 'red',
    progress: 15,
    priorityAction: 'Escalate communication block with engineering team. Send follow-up email.',
    budget: '$18,200',
    deadline: 'Jul 20',
    service: 'Full Stack App',
    briefLocked: true,
    scopeCreepLog: [
      { id: 1, desc: 'CRM integration outside agreement', date: 'Jun 14', status: 'Flagged' }
    ],
    tasks: [
      { id: 1, text: 'Backend DB configuration', completed: true, hours: 12, remaining: 0 },
      { id: 2, text: 'Resolve communication blocker', completed: false, hours: 4, remaining: 4 },
      { id: 3, text: 'CRM api mapping', completed: false, hours: 10, remaining: 10 }
    ],
    timeline: [
      { id: 1, date: 'Jun 1 – Jun 15', title: 'Phase 1 — Discovery', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'Jun 16 – Jul 10', title: 'Phase 2 — Backend Dev', status: '15%', progress: 15, active: true },
      { id: 3, date: 'Jul 11 – Aug 5', title: 'Phase 3 — Frontend Dev', status: 'Pending', progress: 0, active: false }
    ],
    chatLog: [
      { id: 1, sender: 'agency', senderName: 'YOU', avatar: 'DZ', text: 'Hey Nexus team, we have completed the baseline schema designs. We need your CRM access credentials to proceed with the setup. Please share them.', time: 'Monday' },
      { id: 2, sender: 'agency', senderName: 'YOU', avatar: 'DZ', text: 'Following up on the credentials so we do not fall behind on the timeline. Let me know when you can send them over.', time: 'Wednesday' }
    ]
  },
  {
    id: 'kola-creatives',
    name: 'Kola Creatives',
    type: 'pending',
    statusDot: 'gray',
    alertDesc: 'Intake links completed – waiting for review',
    alertBadge: null,
    sentiment: 70,
    sentimentLabel: 'Awaiting Review',
    sentimentColor: 'yellow',
    progress: 0,
    priorityAction: 'Review intake details and approve onboarding to start workspace.',
    budget: '$5,000',
    deadline: 'Oct 10',
    service: 'Copywriting',
    briefLocked: false,
    scopeCreepLog: [],
    tasks: [
      { id: 1, text: 'Approve intake questionnaire', completed: false, hours: 2, remaining: 2 }
    ],
    timeline: [
      { id: 1, date: 'May 20', title: 'Intake Sent', status: 'Active', progress: 50, active: true }
    ],
    chatLog: []
  },
  {
    id: 'zuri-media',
    name: 'Zuri Media',
    type: 'pending',
    statusDot: 'gray',
    alertDesc: 'Intake form sent to client team',
    alertBadge: null,
    sentiment: 60,
    sentimentLabel: 'Sent Link',
    sentimentColor: 'yellow',
    progress: 0,
    priorityAction: 'Remind client team to submit intake details before project kickoff.',
    budget: '$9,000',
    deadline: 'Nov 01',
    service: 'Social Media',
    briefLocked: false,
    scopeCreepLog: [],
    tasks: [
      { id: 1, text: 'Awaiting client response', completed: false, hours: 5, remaining: 5 }
    ],
    timeline: [
      { id: 1, date: 'May 22', title: 'Intake Created', status: 'Active', progress: 20, active: true }
    ],
    chatLog: []
  }
];

export const initialNotifications = [
  { id: 1, text: 'Quantum Logic timeline request is pending.', read: false },
  { id: 2, text: 'Nexus Core communication block flag active.', read: false }
];

export const initialChatMessages = [
  { sender: 'bob', text: 'Atsync AI Companion v1 online. Running client monitoring scans...' },
  { sender: 'bob', text: 'Quantum Logic requires attention (Urgent alert flag). Need me to send a WhatsApp nudger?' }
];

// Intake statistics and submissions
export const initialIntakeStats = {
  linksSent: 8,
  submitted: 6,
  converted: 3,
  pending: 2
};

export const initialIntakeSubmissions = [
  { id: 1, client: 'Quantum Logic', name: 'Sarah J.', service: 'UI Design + Testing', budget: '$12,000', date: 'Jun 10', status: 'Active' },
  { id: 2, client: 'Kola Creatives', name: 'Kola A.', service: 'Website Redesign', budget: '₦800k', date: 'Jun 18', status: 'Pending' },
  { id: 3, client: 'Zuri Media', name: 'Zuri O.', service: 'AI Chatbot', budget: '₦1.2M', date: 'Jun 19', status: 'Pending' },
  { id: 4, client: 'Anon Lead', name: 'Anonymous', service: 'Ecommerce', budget: '₦200k', date: 'Rejected', status: 'Rejected' }
];
