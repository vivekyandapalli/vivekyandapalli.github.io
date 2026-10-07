/**
 * PORTFOLIO CONTENT — the only file you need to edit to change the site.
 *
 * Rules of thumb
 *  - Any item with `enabled: false` is hidden everywhere (3D scene, lists, resume).
 *  - Each experience/project has a `layer`: "application" | "platform" | "infrastructure".
 *  - Anything marked [PLACEHOLDER] is sample text. Replace it with real information.
 *    Nothing here has been verified as fact about you.
 *
 * Note: your old site (vivekyandapalli.github.io/personal-portfolio) is a client-rendered
 * React app, so its content could not be read automatically. Copy over what you want.
 */
export const portfolio = {
  site: {
    title: "Vivek Yandapalli — Software Engineer",
    description: "Software engineer building from interface to infrastructure.", // [PLACEHOLDER]
    url: "https://YOUR_USERNAME.github.io/",
  },

  personal: {
    name: "Vivek Yandapalli", // inferred from your old site's URL — confirm
    title: "Software Engineer",
    tagline: "Building software from interface to infrastructure.",
    bio: "[PLACEHOLDER] One or two sentences on what you build and what you care about.",
    about: [
      "[PLACEHOLDER] First paragraph of your story.",
      "[PLACEHOLDER] Second paragraph: how you work, what you're looking for.",
    ],
    location: "[PLACEHOLDER]",
    email: "you@example.com", // [PLACEHOLDER]
    profileImage: { enabled: false, src: "public/images/profile.jpg", alt: "Portrait" },
  },

  links: {
    github: { enabled: true, label: "GitHub", url: "https://github.com/vivekyandapalli" }, // confirm
    linkedin: { enabled: true, label: "LinkedIn", url: "https://www.linkedin.com/in/YOUR_HANDLE" }, // [PLACEHOLDER]
    resume: { enabled: false, label: "Resume (PDF)", url: "public/resume.pdf" },
  },

  // Order here = order in the teardown, top to bottom.
  layers: {
    application: {
      enabled: true,
      title: "Application",
      summary: "Full-stack, frontend and product engineering.",
      description: "What people see and touch: interfaces, product features, UX.",
      keywords: ["Full-stack", "Frontend", "Product", "UI/UX"],
    },
    platform: {
      enabled: true,
      title: "Platform",
      summary: "Backend, APIs, data and distributed systems.",
      description: "The services and data that applications depend on.",
      keywords: ["APIs", "Databases", "Microservices", "Messaging"],
    },
    infrastructure: {
      enabled: true,
      title: "Infrastructure",
      summary: "Cloud, containers, CI/CD and observability.",
      description: "What it all runs on: delivery pipelines, runtime, monitoring.",
      keywords: ["Cloud", "Kubernetes", "Docker", "CI/CD", "Observability"],
    },
  },

  experience: [
    {
      id: "exp-1",
      enabled: true,
      layer: "application",
      company: "[PLACEHOLDER] Company",
      role: "[PLACEHOLDER] Role",
      start: "YYYY",
      end: "Present",
      summary: "[PLACEHOLDER] What you owned.",
      achievements: [
        // { text: "Built X...", metric: "Reduced latency by X%" }  <- only real numbers
      ],
      technologies: [],
    },
  ],

  projects: [
    {
      id: "proj-1",
      enabled: true,
      layer: "platform",
      name: "[PLACEHOLDER] Project",
      summary: "[PLACEHOLDER] One-line description.",
      links: { source: "", live: "" },
      technologies: [],
      architecture: { enabled: false, image: "", description: "" },
    },
  ],

  skills: [
    { enabled: true, layer: "application", name: "[PLACEHOLDER] Skill" },
  ],

  education: [
    { enabled: true, school: "[PLACEHOLDER] School", degree: "[PLACEHOLDER] Degree", start: "YYYY", end: "YYYY" },
  ],

  achievements: [],     // { enabled: true, text: "..." }
  certifications: [],   // { enabled: true, name: "...", issuer: "...", year: "YYYY", url: "" }
};
