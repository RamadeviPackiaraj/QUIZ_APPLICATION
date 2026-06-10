import {
  activities,
  completionTrend,
  notifications,
  questions,
  quizzes,
  results,
  students,
  organizations,
} from "@/mock";
const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  async dashboard() {
    await wait();
    return {
      metrics: {
        totalStudents: students.length,
        totalQuizzes: quizzes.length,
        completedQuizzes: quizzes.reduce((sum, quiz) => sum + quiz.completed, 0),
        pendingQuizzes: quizzes.reduce((sum, quiz) => sum + Math.max(quiz.assigned - quiz.completed, 0), 0),
        averageScore: Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length),
        passRate: Math.round((results.filter((result) => result.status === "Pass").length / results.length) * 100)
      },
      completionTrend,
      activities,
      leaderboard: results.sort((a, b) => a.rank - b.rank)
    };
  }
};

export const studentService = {
  async list() {
    await wait();
    return students;
  }
};

export const quizService = {
  async list() {
    await wait();
    return quizzes;
  },
  async activeQuiz() {
    await wait();
    return { quiz: quizzes[0], questions };
  }
};

export const questionService = {
  async list() {
    await wait();
    return questions;
  }
};

export const resultService = {
  async list() {
    await wait();
    return results;
  }
};

export const notificationService = {
  async list() {
    await wait();
    return notifications;
  }
};
