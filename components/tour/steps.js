const sel = (id) => `[data-tour-id="${id}"]`;

export const TOUR_STEPS = [
  {
    popover: {
      title: "Welcome to Redux",
      description:
        "Redux is a sandbox for exploring NP-complete problems and the reductions between them. This short tour walks the whole pipeline: pick a problem, reduce it, visualize it, solve it, verify it.",
    },
  },
  {
    element: sel("problem-picker"),
    popover: {
      title: "Pick a problem",
      description:
        "Start by choosing an NP-complete problem, like 3SAT or Clique. Click the info icon beside any picker to see the formal definition.",
    },
  },
  {
    element: sel("instance-input"),
    popover: {
      title: "Your problem instance",
      description:
        "This is the concrete instance you'll work with. Redux fills in a default when you pick a problem, but you can edit it or upload your own — it's checked live, so you'll know if the format is off.",
    },
  },
  {
    element: sel("reduce-row"),
    popover: {
      title: "Reduce it",
      description:
        "Reductions are the heart of NP-completeness: transform your instance into an instance of a different problem so that the answers agree. Choose a target problem and a reduction algorithm here.",
    },
  },
  {
    element: sel("reduce-button"),
    popover: {
      title: "Run the reduction",
      description:
        "Press Reduce and the algorithm transforms your instance. The reduced instance appears above — same question, different problem.",
    },
  },
  {
    element: sel("viz-controls"),
    popover: {
      title: "Step through the construction",
      description:
        "These controls animate how the picture is built. Step forward and back, or flip the switches to highlight gadgets, show the solution, or view the reduction side by side.",
    },
  },
  {
    element: sel("viz-canvas"),
    popover: {
      title: "See it drawn",
      description:
        "Once a problem is selected, your instance is drawn here. Watching the gadgets appear step by step is the best way to understand what a reduction actually constructs.",
    },
  },
  {
    element: sel("solve-row"),
    expandRow: true,
    popover: {
      title: "Solve it",
      description:
        "Pick a solver and press Solve to get a certificate — a concrete solution to your instance. Solving the reduced instance also answers the original one; that's the point of reducing.",
    },
  },
  {
    element: sel("verify-row"),
    expandRow: true,
    popover: {
      title: "Verify a certificate",
      description:
        "Verification is the easy half of NP: paste any certificate and the verifier checks it in polynomial time. Try the solver's answer — or one you wrote yourself.",
    },
  },
  {
    element: sel("share-button"),
    popover: {
      title: "Share your setup",
      description:
        "This copies a link that reproduces your exact problem, instance, and reduction choices — handy for assignments or sharing with classmates.",
    },
  },
  {
    popover: {
      title: "You're ready",
      description:
        "That's the loop: problem → reduce → visualize → solve → verify. Replay this tour anytime from the button in the corner.",
    },
  },
];

export const TOUR_SELECTORS = TOUR_STEPS.filter((step) => step.element).map((step) => step.element);
