export const users = [
    { id: 1, name: "Anthony" },
    { id: 2, name: "Taylor" }
];

export const projects = [
    { id: 1, name: "Personal" },
    { id: 2, name: "School" }
];

export const tasks = [
    { id: 1, title: "Learn Express", completed: false, priority: "med", projectId: 2, assignedTo: 1, dueDate: "2025-09-15" },
    { id: 2, title: "Build Task API", completed: false, priority: "high", projectId: 2, assignedTo: 1 },
    { id: 3, title: "Buy groceries", completed: true, priority: "low", projectId: 1, assignedTo: 2 }
];

export const nextIds = {
    user: 3,
    project: 3,
    task: 4
};