// ATSYNC Dashboard Mock Data

export const initialClients = [
  {
    id: 'madestone-fa',
    name: 'Madestone Football Academy',
    company: 'Madestone Football Academy',
    type: 'active',
    statusDot: 'red', // red dot
    alertBadge: 'warning',
    alertDesc: 'Homepage wireframe overdue',
    sentiment: 58,
    sentimentLabel: 'Needs attention',
    sentimentColor: 'red',
    progress: 40,
    budget: '₦120,000',
    deadline: '2026-06-28',
    service: 'Web + Branding',
    briefLocked: true,
    priorityAction: 'Send homepage wireframe before Thursday or sentiment drops further.',
    tasks: [
      { id: 1, text: 'Homepage wireframe — 2 days overdue', completed: false, hours: 8, remaining: 8, overdue: true },
      { id: 2, text: 'Logo revision round 2 — due tomorrow', completed: false, hours: 4, remaining: 2, overdue: false },
      { id: 3, text: 'Brand colours — approved', completed: true, hours: 2, remaining: 0, overdue: false }
    ],
    timeline: [
      { id: 1, date: 'May 15', title: 'Discovery', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'May 28', title: 'Brand Strategy', status: 'Done', progress: 100, active: false },
      { id: 3, date: 'Jun 14', title: 'Design Review', status: '40%', progress: 40, active: true },
      { id: 4, date: 'Jun 22', title: 'Development', status: 'Pending', progress: 0, active: false },
      { id: 5, date: 'Jun 28', title: 'Final Handoff', status: 'Pending', progress: 0, active: false }
    ],
    chatLog: [
      {
        id: 1,
        sender: 'client',
        senderName: 'ADAEZE',
        avatarInitials: 'AO',
        text: 'Hi, when will the homepage design be ready? We need it before end of week.',
        time: 'Mon 2:14 PM'
      },
      {
        id: 2,
        sender: 'agency',
        senderName: 'DANIEL',
        avatarInitials: 'DZ',
        text: "Finishing the second wireframe iteration now. You'll have it by Thursday EOD — I'll drop the review link directly in here.",
        time: 'Mon 2:31 PM'
      },
      {
        id: 3,
        sender: 'client',
        senderName: 'ADAEZE',
        avatarInitials: 'AO',
        text: 'Perfect. Also can we add a gallery section? The CEO mentioned it this morning.',
        time: 'Mon 3:05 PM'
      },
      {
        id: 4,
        sender: 'agency',
        senderName: 'DANIEL',
        avatarInitials: 'DZ',
        text: "That's outside the original brief scope. I can log it as a change request — adds ₦25,000 and 3 days. Want me to raise a formal CR?",
        time: 'Mon 3:12 PM'
      },
      {
        id: 5,
        sender: 'client',
        senderName: 'ADAEZE',
        avatarInitials: 'AO',
        text: "Yes please, let's do it properly.",
        time: 'Mon 3:18 PM'
      }
    ],
    scopeCreepLog: [
      { id: 1, desc: 'Gallery section added — pending CR #001', date: 'Yesterday', status: 'Flagged' }
    ]
  },
  {
    id: 'don-frayo-re',
    name: 'Don Frayo Real Estate',
    company: 'Don Frayo Real Estate',
    type: 'active',
    statusDot: 'orange', // amber dot
    alertBadge: 'warning',
    alertDesc: 'Mobile responsiveness due soon',
    sentiment: 71,
    sentimentLabel: 'Stable',
    sentimentColor: 'yellow',
    progress: 65,
    budget: '₦60,000',
    deadline: '2026-07-10',
    service: 'Landing Page',
    briefLocked: true,
    priorityAction: 'Implement and test mobile layouts for landing page.',
    tasks: [
      { id: 1, text: 'Mobile responsiveness — due in 2 days', completed: false, hours: 6, remaining: 6, overdue: false }
    ],
    timeline: [
      { id: 1, date: 'Jun 30', title: 'Design', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'Jul 10', title: 'Development', status: '65%', progress: 65, active: true }
    ],
    chatLog: [],
    scopeCreepLog: [
      { id: 1, desc: '3rd revision — exceeds 2 free revisions', date: 'Mon 11:40 AM', status: 'Flagged' }
    ]
  },
  {
    id: 'tolans-bakery',
    name: 'Tolans Bakery',
    company: 'Tolans Bakery',
    type: 'active',
    statusDot: 'green', // green dot
    alertBadge: 'ready',
    alertDesc: 'Phase 1 - e-commerce delivered',
    sentiment: 88,
    sentimentLabel: 'Great',
    sentimentColor: 'green',
    progress: 90,
    budget: '₦180,000',
    deadline: '2026-06-25',
    service: 'E-commerce',
    briefLocked: true,
    priorityAction: 'Verify Paystack credentials and run live transaction test.',
    tasks: [
      { id: 1, text: 'Paystack integration test — in progress', completed: false, hours: 4, remaining: 4, overdue: false }
    ],
    timeline: [
      { id: 1, date: 'May 30', title: 'Onboarding', status: 'Done', progress: 100, active: false },
      { id: 2, date: 'Jun 15', title: 'Core Dev', status: 'Done', progress: 100, active: false },
      { id: 3, date: 'Jun 25', title: 'Final Review', status: '90%', progress: 90, active: true }
    ],
    chatLog: [],
    scopeCreepLog: []
  },
  {
    id: '542-fitness',
    name: '542 Fitness',
    company: '542 Fitness',
    type: 'active',
    statusDot: 'purple', // purple dot
    alertBadge: 'pending',
    alertDesc: 'Onboarding in progress',
    sentiment: 82,
    sentimentLabel: 'Stable',
    sentimentColor: 'green',
    progress: 15,
    budget: '₦150,000',
    deadline: '2026-07-20',
    service: 'Web Design',
    briefLocked: false,
    priorityAction: 'Follow up with client to fill brief form.',
    tasks: [
      { id: 1, text: 'Brief form sent — awaiting client fill', completed: false, hours: 2, remaining: 2, overdue: false }
    ],
    timeline: [
      { id: 1, date: 'Jul 20', title: 'Onboarding', status: '15%', progress: 15, active: true }
    ],
    chatLog: [],
    scopeCreepLog: []
  },
  {
    id: 'chukwu-foods',
    name: 'Chukwu Foods',
    company: 'Chukwu Foods',
    type: 'pending',
    statusDot: 'gray',
    alertBadge: 'pending',
    alertDesc: 'Awaiting questionnaire submission',
    sentiment: '—',
    sentimentLabel: 'Pending',
    sentimentColor: 'yellow',
    progress: 0,
    budget: '₦200,000',
    deadline: '2026-07-05',
    service: 'Intake',
    briefLocked: false,
    priorityAction: 'Awaiting client intake form details.',
    tasks: [
      { id: 1, text: 'Awaiting questionnaire completion', completed: false, hours: 0, remaining: 0, overdue: false }
    ],
    timeline: [],
    chatLog: [],
    scopeCreepLog: []
  }
];

export const initialNotifications = [
  { id: 1, text: 'Madestone FA added a scope creep flag: Gallery section.', read: false },
  { id: 2, text: 'Don Frayo RE exceeded free revisions limit.', read: false },
  { id: 3, text: 'Tolans Bakery delivery ready for final approval.', read: true }
];

export const initialChatMessages = [
  { sender: 'bob', text: "Hello Daniel! I'm Bob, your agency AI. I track roster status, alert you to scope creep, and draft client nudges." },
  { sender: 'bob', text: "Try asking me 'status' or 'nudge'." }
];
