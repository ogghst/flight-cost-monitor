class UserService {
  async getUserProfile() {
    const response = await fetch('/api/users/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  }

  async updateUserProfile(data: {
    firstName?: string;
    lastName?: string;
    image?: string;
  }) {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    return response.json();
  }
}

export const userService = new UserService();
