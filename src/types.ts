export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'learner' | 'mentor';
  userType: 'teacher' | 'student';
  subjects: string[];
  rating?: number;
  profilePic?: string;
  collegeId?: string;
  collegeName?: string;
}

export interface Post {
  id: string;
  type: 'doubt' | 'offer';
  authorId: string;
  title: string;
  description: string;
  subject: string;
  createdAt: number;
  status: 'open' | 'matched' | 'completed';
}

export interface Match {
  id: string;
  postId: string;
  learnerId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'completed';
  scheduledTime?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: number;
  fileUrl?: string; // e.g. from Firebase Storage
  fileName?: string;
  fileType?: string;
}
