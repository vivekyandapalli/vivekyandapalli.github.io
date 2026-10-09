/**
 * PORTFOLIO CONTENT — the only file you need to edit to change the site.
 *
 * Rules of thumb
 *  - Any item with `enabled: false` is hidden everywhere (3D scene, lists, resume).
 *  - Each experience/project has a `layer`: "application" | "platform" | "infrastructure".
 *  - Anything marked [PLACEHOLDER] is sample text. Replace it with real information.
 *
 * Resume details provided by Vivek are used below. Add only verified information.
 */
export const portfolio = {
  site: {
    title: "Vivek Yandapalli — Senior Software Engineer",
    description:
      "Senior software engineer focused on full-stack application development, with hands-on experience in deployment automation and Linux server operations.",
    url: "https://vivekyandapalli.github.io/personal-portfolio/",
    image: "", // social preview image, e.g. "public/images/og.png" (1200x630)
  },

  // Optional custom 3D model. Leave url empty to use the built-in procedural hardware.
  // A .glb must contain one top-level node per layer, named exactly: application, platform, infrastructure
  // (each centred at the origin, ~3.4 x 2.4 units). See README → "Replace the 3D model".
  model: { url: "" },

  personal: {
    name: "Vivek Yandapalli", // inferred from your old site's URL — confirm
    title: "Senior Software Engineer",
    tagline:
      "Full-stack application development with hands-on deployment and Linux operations.",
    bio: "Senior software engineer with around 10 years of experience across front-end and back-end development. Skilled at translating complex requirements into user-friendly interfaces and delivering holistic solutions, with a commitment to staying current with industry trends.",
    about: [
      "Deploys frontend applications to Cloudflare Pages and automates Docker-based backend releases to DigitalOcean with GitHub Actions, including migrations, service health checks, rollback logic, and telemetry with OpenTelemetry and Grafana Alloy.",
      "Backend platform experience includes Python background processing with Celery and Redis, FastAPI background tasks, PostgreSQL, and Cloudflare R2 object storage.",
      "Manages Linux servers, including installing and updating packages and configuring firewalls.",
    ],
    location: "Hyderabad",
    phone: "8590771160",
    availability: { enabled: false, text: "Open to new opportunities" }, // shown in Contact when enabled
    email: "vivekyandapalli@gmail.com",
    profileImage: {
      enabled: false,
      src: "public/images/profile.jpg",
      alt: "Portrait",
    },
  },

  links: {
    github: {
      enabled: true,
      label: "GitHub",
      url: "https://github.com/vivekyandapalli",
    }, // confirm
    linkedin: {
      enabled: false,
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/vivekyandapalli",
    }, // [PLACEHOLDER]
    website: {
      enabled: true,
      label: "Website",
      url: "https://vivekyandapalli.github.io/personal-portfolio/",
    },
    resume: { enabled: false, label: "Resume (PDF)", url: "public/resume.pdf" },
  },

  // Order here = order in the teardown, top to bottom.
  // `keywords` are also printed on the 3D parts (e.g. Platform: APIs, Databases, Microservices, Messaging).
  layers: {
    application: {
      enabled: true,
      title: "Application",
      summary: "Full-stack, frontend and product engineering.",
      description:
        "What people see and touch: interfaces, product features, UX.",
      keywords: ["Full-stack", "Frontend", "Product", "UI/UX"],
      highlights: [
        "Builds modular Angular and React applications with micro-frontend architecture.",
        "Creates data-visualization tools that make complex information easier to understand.",
        "Works with users and development teams to turn requirements into practical interfaces.",
      ],
    },
    platform: {
      enabled: true,
      title: "Platform",
      summary: "APIs, background processing, databases and object storage.",
      description:
        "Build backend services and asynchronous data workflows with reliable persistence and storage.",
      keywords: [
        "FastAPI",
        "Python",
        "Celery",
        "Redis",
        "PostgreSQL",
        "Cloudflare R2",
        "Background Jobs",
      ],
      highlights: [
        "Builds Python background processing with Celery and Redis, alongside FastAPI background tasks.",
        "Works with PostgreSQL for persistent application data and Cloudflare R2 for object storage.",
      ],
    },
    infrastructure: {
      enabled: true,
      title: "Infrastructure",
      summary:
        "Frontend hosting, Linux server administration, deployment automation and observability.",
      description:
        "Deploy frontend applications to Cloudflare Pages and manage secure, observable Linux server workloads.",
      keywords: [
        "Linux",
        "Server Admin",
        "Firewalls",
        "Docker",
        "GitHub Actions",
        "Cloudflare Pages",
        "DigitalOcean",
      ],
      highlights: [
        "Deploys frontend applications to Cloudflare Pages and containerized backend releases to DigitalOcean.",
        "Automates release workflows with GitHub Actions, including migrations, health checks, and rollback handling.",
        "Administers Linux servers, installs packages, configures firewalls, and sets up application telemetry.",
      ],
    },
  },

  experience: [
    {
      id: "luxxoft-senior-software-engineer",
      enabled: true,
      layer: "application",
      company: "Luxoft",
      location: "Hyderabad, Telangana",
      role: "Senior Software Engineer",
      start: "07/2022",
      end: "Present",
      summary:
        "Develops data-science tooling and modular micro-frontend applications.",
      achievements: [
        {
          text: "Built tools that streamline feature creation and automate data scraping, reducing repetitive work.",
        },
        {
          text: "Gathers user requirements and bridges communication between users and development teams.",
        },
        {
          text: "Builds modular applications with Angular and Webpack using a micro-frontend architecture.",
        },
        {
          text: "Balances hands-on technical work with leadership throughout development.",
        },
      ],
      technologies: ["Angular", "Webpack", "Micro Frontends"],
    },
    {
      id: "adp-senior-member-technical",
      enabled: true,
      layer: "application",
      company: "ADP",
      location: "Hyderabad, Telangana",
      role: "Senior Member Technical",
      start: "05/2021",
      end: "06/2022",
      summary:
        "Led UI development for service-team portals and data-visualization applications.",
      achievements: [
        {
          text: "Led development of a portal enabling service teams to create and integrate their own micro-frontend applications.",
        },
        {
          text: "Helped create a consolidated platform for a range of service requests.",
        },
        {
          text: "Developed functional, user-friendly micro-frontends with React.",
        },
        {
          text: "Led visualization application development with React, Python, and D3.js to make complex data easier to understand.",
        },
      ],
      technologies: ["React", "Python", "D3.js", "Micro Frontends"],
    },
    {
      id: "gramener-ui-team-lead",
      enabled: true,
      layer: "application",
      company: "Gramener",
      location: "Hyderabad, Telangana",
      role: "UI Team Lead",
      start: "06/2018",
      end: "04/2021",
      summary:
        "Led the UI team in designing and building interactive data-visualization applications for clients.",
      achievements: [
        {
          text: "Built visualization applications with React, Python, and D3.js to help clients explore complex data interactively.",
        },
        {
          text: "Created intuitive visual representations that reduced reliance on navigating raw data and supported data-driven decisions.",
        },
      ],
      technologies: ["React", "Python", "D3.js"],
    },
    {
      id: "eram-software-engineer",
      enabled: true,
      layer: "application",
      company: "Eram Infotech",
      location: "Trivandrum, Kerala",
      role: "Software Engineer",
      start: "08/2016",
      end: "05/2018",
      summary:
        "Developed a customized travel and accounting solution using the Odoo ERP and CRM framework.",
      achievements: [
        {
          text: "Built an application for travel agencies to book tickets and manage accounting workflows.",
        },
        {
          text: "Created a user-friendly solution with Python, HTML, JavaScript, and CSS.",
        },
      ],
      technologies: ["Python", "Odoo", "HTML", "JavaScript", "CSS"],
    },
  ],

  projects: [],

  skills: [
    { enabled: true, layer: "application", name: "React" },
    { enabled: true, layer: "application", name: "Angular" },
    { enabled: true, layer: "application", name: "Web Components" },
    { enabled: true, layer: "application", name: "Micro Frontends" },
    { enabled: true, layer: "application", name: "PrimeNG" },
    { enabled: true, layer: "application", name: "PrimeFlex" },
    { enabled: true, layer: "application", name: "Tailwind CSS" },
    { enabled: true, layer: "application", name: "D3.js" },
    { enabled: true, layer: "application", name: "HTML" },
    { enabled: true, layer: "application", name: "CSS" },
    { enabled: true, layer: "platform", name: "Python" },
    { enabled: true, layer: "platform", name: "Git" },
    { enabled: true, layer: "platform", name: "FastAPI" },
    { enabled: true, layer: "platform", name: "Celery" },
    { enabled: true, layer: "platform", name: "Redis" },
    { enabled: true, layer: "platform", name: "PostgreSQL" },
    { enabled: true, layer: "platform", name: "Cloudflare R2" },
    { enabled: true, layer: "platform", name: "Background Jobs" },
    { enabled: true, layer: "infrastructure", name: "Docker" },
    { enabled: true, layer: "infrastructure", name: "Docker Compose" },
    { enabled: true, layer: "infrastructure", name: "GitHub Actions" },
    { enabled: true, layer: "infrastructure", name: "Cloudflare Pages" },
    { enabled: true, layer: "infrastructure", name: "DigitalOcean" },
    { enabled: true, layer: "infrastructure", name: "OpenTelemetry" },
    { enabled: true, layer: "infrastructure", name: "Grafana Alloy" },
    {
      enabled: true,
      layer: "infrastructure",
      name: "Linux Server Administration",
    },
    { enabled: true, layer: "infrastructure", name: "Package Management" },
    { enabled: true, layer: "infrastructure", name: "Firewall Configuration" },
  ],

  education: [
    {
      enabled: true,
      school: "College Of Engineering Trivandrum",
      degree: "M.Tech in Electrical Machines",
      start: "2014",
      end: "2016",
    },
    {
      enabled: true,
      school: "MVGR College of Engineering",
      degree: "B.Tech in Electrical and Electronics Engineering",
      start: "2009",
      end: "2013",
    },
  ],

  achievements: [], // { enabled: true, text: "..." }
  certifications: [
    {
      enabled: true,
      name: "Linux Foundation Certified System Administrator (LFCS)",
      issuer: "The Linux Foundation",
    },
  ],
};
