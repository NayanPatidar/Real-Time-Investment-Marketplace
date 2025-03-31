import { getAllNotifications } from "@/api/notification";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface Notification {
  id: number;
  userId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Fetch notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log(user);

        if (!user) return;
        const response = await getAllNotifications(user?.id as number);
        console.log(response);
        setNotifications(response);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative flex items-center text-gray-600 hover:text-gray-900"
      >
        Notifications
        {notifications.length > 0 && (
          <span className="ml-2 inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Notifications
            </h3>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {notifications && notifications.length === 0 ? (
              <li className="p-4 text-gray-500">No new notifications</li>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="p-4 border-t border-gray-200"
                >
                  <p className="text-sm text-gray-700">
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
