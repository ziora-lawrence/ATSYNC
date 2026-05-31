// ATSYNC Dashboard Mock Data

export const initialClients = [
  {
    id: 'quantum-logic',
    name: 'Quantum Logic',
    company: 'Quantum Logic',
    type: 'active',
    statusDot: 'orange', // maps to 'da' (alert) or custom css
    alertBadge: 'warning',
    alertDesc: 'Awaiting response on timeline request',
    sentiment: 85,
    sentimentLabel: 'Cautious →',
    sentimentColor: 'yellow',
    progress: 62,
    budget: '$12,000',
    deadline: 'Aug 30',
    service: 'UI + Testing',
    briefLocked: true,
    priorityAction: 'Review resource allocation for staggered testing schedule.',
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
      {
        id: 1,
        sender: 'client',
        senderName: 'SARAH J.',
        avatarInitials: 'SJ',
        text: "The latest wireframes look solid. The executive team is asking if we can accelerate the timeline for user testing. What's the impact if we pull it in by a week?",
        time: '10:42 AM'
      },
      {
        id: 2,
        sender: 'agency',
        senderName: 'DANIEL',
        avatarInitials: 'DZ',
        text: 'Understood. Reviewing resource allocation now — we might be able to do a staggered approach. Let me run the numbers.',
        time: '11:05 AM'
      }
    ],
    scopeCreepLog: [
      { id: 1, desc: 'Mobile breakpoints added after brief lock', date: 'Jun 17', status: 'Flagged' }
    ]
  },
  {
    id: 'apex-ventures',
    name: 'Apex Ventures',
    company: 'Apex Ventures',
    type: 'active',
    statusDot: 'green', // maps to 'dg'
    alertBadge: 'ready',
    alertDesc: 'Brief approved — phase 2 ready',
    sentiment: 92,
    sentimentLabel: 'Great',
    sentimentColor: 'green',
    progress: 100,
    budget: '$8,500',
    deadline: 'Jul 15',
    service: 'Branding + Deck',
    briefLocked: true,
    priorityAction: 'Kick off Deck design phase with brand guidelines.',
    tasks: [
      { id: 1, text: 'Create style guide drafts', completed: true, hours: 5, remaining: 0 },
      { id: 2, text: 'Confirm deck slides outline', completed: true, hours: 3, remaining: 0 }
    ],
    timeline: [
      { id: 1, date: 'May 1 – May 15', title: 'Phase 1 — Discovery', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'May 16 – Jun 1', title: 'Phase 2 — Branding', status: 'Done', progress: 100, active: false }
    ],
    chatLog: [
      {
        id: 1,
        sender: 'client',
        senderName: 'MARCUS K.',
        avatarInitials: 'MK',
        text: 'The branding assets look amazing. We are ready to proceed to the pitch deck design.',
        time: 'Yesterday'
      },
      {
        id: 2,
        sender: 'agency',
        senderName: 'DANIEL',
        avatarInitials: 'DZ',
        text: 'Awesome news! Phase 2 is fully approved. Setting up the pitch deck templates now.',
        time: 'Yesterday'
      }
    ],
    scopeCreepLog: [
      { id: 1, desc: 'Copy changes post-approval', date: 'Jun 9', status: 'Resolved' }
    ]
  },
  {
    id: 'nexus-core',
    name: 'Nexus Core',
    company: 'Nexus Core',
    type: 'active',
    statusDot: 'red', // maps to 'dr'
    alertBadge: 'overdue',
    alertDesc: 'No reply in 4 days',
    sentiment: 45,
    sentimentLabel: 'Critical',
    sentimentColor: 'red',
    progress: 15,
    budget: '$25,000',
    deadline: 'Oct 15',
    service: 'Full Platform Dev',
    briefLocked: false,
    priorityAction: 'Follow up with product owner immediately.',
    tasks: [
      { id: 1, text: 'Draft technical specifications', completed: false, hours: 12, remaining: 12 },
      { id: 2, text: 'Set up repo & backend schema', completed: false, hours: 8, remaining: 8 }
    ],
    timeline: [
      { id: 1, date: 'Jun 10 – Jun 20', title: 'Phase 1 — ArchitectureSpecs', status: '15%', progress: 15, active: true }
    ],
    chatLog: [
      {
        id: 1,
        sender: 'agency',
        senderName: 'DANIEL',
        avatarInitials: 'DZ',
        text: 'Hi Sarah, following up on the tech specs document. Let me know when your team has a slot to review it.',
        time: '4 days ago'
      }
    ],
    scopeCreepLog: [
      { id: 1, desc: 'CRM integration outside agreement', date: 'Jun 14', status: 'Flagged' }
    ]
  },
  {
    id: 'kola-creatives',
    name: 'Kola Creatives',
    company: 'Kola Creatives',
    type: 'pending',
    statusDot: 'yellow',
    alertBadge: 'pending',
    alertDesc: 'Awaiting questionnaire submission',
    sentiment: '—',
    sentimentLabel: 'Pending',
    sentimentColor: 'yellow',
    progress: 0,
    budget: '₦800k',
    deadline: 'Jun 18',
    service: 'Website Redesign',
    briefLocked: false,
    priorityAction: 'Send reminder for questionnaire.',
    tasks: [
      { id: 1, text: 'Awaiting intake completion', completed: false, hours: 0, remaining: 0 }
    ],
    timeline: [
      { id: 1, date: 'Pending', title: 'Intake Questionnaire', status: 'Pending', progress: 0, active: true }
    ],
    chatLog: [],
    scopeCreepLog: []
  },
  {
    id: 'zuri-media',
    name: 'Zuri Media',
    company: 'Zuri Media',
    type: 'pending',
    statusDot: 'yellow',
    alertBadge: 'pending',
    alertDesc: 'Awaiting questionnaire submission',
    sentiment: '—',
    sentimentLabel: 'Pending',
    sentimentColor: 'yellow',
    progress: 0,
    budget: '₦1.2M',
    deadline: 'Jun 19',
    service: 'AI Chatbot',
    briefLocked: false,
    priorityAction: 'Awaiting onboarding data.',
    tasks: [
      { id: 1, text: 'Awaiting intake completion', completed: false, hours: 0, remaining: 0 }
    ],
    timeline: [
      { id: 1, date: 'Pending', title: 'Intake Questionnaire', status: 'Pending', progress: 0, active: true }
    ],
    chatLog: [],
    scopeCreepLog: []
  }
];

export const initialNotifications = [
  { id: 1, text: 'Quantum Logic flagged a new scope creep item: Mobile breakpoints.', read: false },
  { id: 2, text: 'Nexus Core has not responded to messages in 4 days.', read: false },
  { id: 3, text: 'Apex Ventures approved their Phase 2 Brief.', read: true }
];

export const initialChatMessages = [
  { sender: 'bob', text: "Hello Daniel! I'm Bob, your agency AI. I track roster status, alert you to scope creep, and draft client nudges." },
  { sender: 'bob', text: "Try asking me 'status' or 'nudge'." }
];
