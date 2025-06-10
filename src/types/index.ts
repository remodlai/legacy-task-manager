// Task status enum: defines the current stage of a task in the workflow
export enum TaskStatus {
  PENDING = "pending", // Task created but not yet started
  IN_PROGRESS = "in_progress", // Task currently being executed
  COMPLETED = "completed", // Task successfully completed and verified
  BLOCKED = "blocked", // Task temporarily blocked due to dependencies
}

// Task dependency: defines prerequisite relationships between tasks
export interface TaskDependency {
  taskId: string; // Unique identifier of prerequisite task that must be completed before current task
}

// Related file type: defines the relationship type between files and tasks
export enum RelatedFileType {
  TO_MODIFY = "TO_MODIFY", // Files that need to be modified in the task
  REFERENCE = "REFERENCE", // Reference materials or related documentation
  CREATE = "CREATE", // Files that need to be created in the task
  DEPENDENCY = "DEPENDENCY", // Component or library files that the task depends on
  OTHER = "OTHER", // Other types of related files
}

// Related file: defines information about task-related files
export interface RelatedFile {
  path: string; // File path, can be relative to project root or absolute path
  type: RelatedFileType; // Relationship type between file and task
  description?: string; // Additional description explaining relationship or purpose
  lineStart?: number; // Starting line of relevant code block (optional)
  lineEnd?: number; // Ending line of relevant code block (optional)
}

// Task interface: defines complete task data structure
export interface Task {
  id: string; // Unique task identifier
  name: string; // Clear and concise task name
  description: string; // Detailed task description including implementation points and acceptance criteria
  notes?: string; // Additional notes, special handling requirements or implementation suggestions (optional)
  status: TaskStatus; // Current task execution status
  dependencies: TaskDependency[]; // List of prerequisite task dependencies
  createdAt: Date; // Task creation timestamp
  updatedAt: Date; // Task last update timestamp
  completedAt?: Date; // Task completion timestamp (only for completed tasks)
  summary?: string; // Task completion summary describing results and key decisions (only for completed tasks)
  relatedFiles?: RelatedFile[]; // List of task-related files (optional)

  // New field: stores complete technical analysis results
  analysisResult?: string; // Complete analysis results from analyze_task and reflect_task phases

  // New field: stores specific implementation guidelines
  implementationGuide?: string; // Specific implementation methods, steps and recommendations

  // New field: stores verification standards and inspection methods
  verificationCriteria?: string; // Clear verification standards, test points and acceptance conditions
}

// Task complexity level: defines task complexity classification
export enum TaskComplexityLevel {
  LOW = "Low Complexity", // Simple and straightforward tasks requiring no special handling
  MEDIUM = "Medium Complexity", // Tasks with moderate complexity but still manageable
  HIGH = "High Complexity", // Complex and time-consuming tasks requiring special attention
  VERY_HIGH = "Very High Complexity", // Extremely complex tasks recommended for breakdown
}

// Task complexity thresholds: defines reference standards for task complexity assessment
export const TaskComplexityThresholds = {
  DESCRIPTION_LENGTH: {
    MEDIUM: 500, // Exceeding this character count indicates medium complexity
    HIGH: 1000, // Exceeding this character count indicates high complexity
    VERY_HIGH: 2000, // Exceeding this character count indicates very high complexity
  },
  DEPENDENCIES_COUNT: {
    MEDIUM: 2, // Exceeding this dependency count indicates medium complexity
    HIGH: 5, // Exceeding this dependency count indicates high complexity
    VERY_HIGH: 10, // Exceeding this dependency count indicates very high complexity
  },
  NOTES_LENGTH: {
    MEDIUM: 200, // Exceeding this character count indicates medium complexity
    HIGH: 500, // Exceeding this character count indicates high complexity
    VERY_HIGH: 1000, // Exceeding this character count indicates very high complexity
  },
};

// Task complexity assessment result: records detailed results of task complexity analysis
export interface TaskComplexityAssessment {
  level: TaskComplexityLevel; // Overall complexity level
  metrics: {
    // Detailed data for each assessment metric
    descriptionLength: number; // Description length
    dependenciesCount: number; // Number of dependencies
    notesLength: number; // Notes length
    hasNotes: boolean; // Whether notes exist
  };
  recommendations: string[]; // List of handling recommendations
}
