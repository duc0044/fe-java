import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from "@/hooks/use-toast";
import { AuthenticatedImage } from '@/components/AuthenticatedImage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Camera, Save, LogOut } from "lucide-react";
import type { UserProfile } from '@/stores/authStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        setProfile(res.data);
        useAuthStore.getState().setUserProfile(res.data);
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
        });
      } catch (error) {
        console.error('Lỗi khi tải profile:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin cá nhân",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !profile) return;

    setUploadingAvatar(true);
    try {
      const uploadRes = await authService.uploadAvatar(profile.id || 0, avatarFile);

      // Update profile with avatar URL from response immediately
      const newAvatarUrl = uploadRes.data?.avatarUrl || uploadRes.data?.fileName;
      if (newAvatarUrl) {
        const updatedProfile = {
          ...profile,
          avatarUrl: newAvatarUrl
        };
        setProfile(updatedProfile);
        useAuthStore.getState().setUserProfile(updatedProfile);
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật ảnh đại diện",
        variant: "success",
      });

      // Clear avatar preview and file
      setAvatarFile(null);
      setAvatarPreview(null);

      // Reload profile after a longer delay to ensure database transaction is fully committed
      setTimeout(async () => {
        try {
          const res = await authService.getProfile();
          // Only update if the response has a different avatar URL
          // This prevents overwriting with stale cache data
          if (res.data?.avatarUrl && res.data.avatarUrl !== newAvatarUrl) {
            setProfile(res.data);
            useAuthStore.getState().setUserProfile(res.data);
          } else if (res.data) {
            // Ensure profile is fully synced
            const syncedProfile = {
              ...res.data,
              avatarUrl: newAvatarUrl
            };
            setProfile(syncedProfile);
            useAuthStore.getState().setUserProfile(syncedProfile);
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi upload ảnh đại diện";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile) return;

    try {
      await authService.deleteAvatar(profile.id || 0);

      // Update profile state immediately
      const updatedProfile = {
        ...profile,
        avatarUrl: undefined as string | undefined
      };
      setProfile(updatedProfile);
      useAuthStore.getState().setUserProfile(updatedProfile);

      toast({
        title: "Thành công",
        description: "Đã xóa ảnh đại diện",
        variant: "success",
      });

      // Reload profile after a longer delay to ensure database transaction is fully committed
      setTimeout(async () => {
        try {
          const res = await authService.getProfile();
          setProfile(res.data);
          useAuthStore.getState().setUserProfile(res.data);
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi xóa ảnh đại diện";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setUpdating(true);
    try {
      // Only update username if changed (password update would require separate endpoint)
      await authService.updateUser(profile.id, {
        username: formData.username,
        email: formData.email,
      });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân",
        variant: "success",
      });
      // Reload profile
      const res = await authService.getProfile();
      setProfile(res.data);
      useAuthStore.getState().setUserProfile(res.data);
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi cập nhật thông tin";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải thông tin cá nhân...</div>;
  }

  const displayProfile = profile || userProfile;
  const username = displayProfile?.username || 'Người dùng';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin tài khoản và cài đặt cá nhân</p>
        </div>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                {avatarPreview ? (
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-blue-200 shadow-lg">
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : displayProfile?.avatarUrl ? (
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-lg">
                    <AuthenticatedImage
                      src={authService.getAvatarUrl(displayProfile.avatarUrl) || displayProfile.avatarUrl}
                      alt={username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                    {username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Username Display */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">{username}</h2>
                <p className="text-sm text-slate-500 mt-1">{displayProfile?.email}</p>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  <label htmlFor="avatar-input">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full gap-2 cursor-pointer"
                    >
                      <span>
                        <Camera size={18} />
                        Chọn ảnh
                      </span>
                    </Button>
                  </label>
                </div>

                {avatarFile && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleUploadAvatar}
                      disabled={uploadingAvatar}
                      className="w-full gap-2"
                    >
                      <Upload size={18} />
                      {uploadingAvatar ? 'Đang tải...' : 'Cập nhật ảnh'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="w-full gap-2"
                    >
                      <X size={18} />
                      Hủy
                    </Button>
                  </div>
                )}

                {!avatarFile && displayProfile?.avatarUrl && (
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={handleDeleteAvatar}
                  >
                    <X size={18} />
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-slate-700 font-semibold">Tên người dùng</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên người dùng"
                    className="h-11 bg-slate-50/80 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="Email"
                    className="h-11 bg-slate-100 border-slate-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email không thể thay đổi</p>
                </div>

                <Button
                  type="submit"
                  disabled={updating}
                  className="w-full gap-2 h-11"
                >
                  <Save size={18} />
                  {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-3 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Mã số</p>
                <p className="text-slate-800 font-mono font-bold">#{displayProfile?.id || 'N/A'}</p>
              </div>

              <div className="py-3 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Email</p>
                <p className="text-slate-800 font-medium">{displayProfile?.email || 'N/A'}</p>
              </div>

              <div className="py-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Vai trò</p>
                <div className="flex flex-wrap gap-2">
                  {displayProfile?.roles ? (
                    Array.isArray(displayProfile.roles) ? (
                      displayProfile.roles.map((role: string) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role.replace('ROLE_', '')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {String(displayProfile.roles).replace('ROLE_', '')}
                      </Badge>
                    )
                  ) : (
                    <span className="text-slate-400 text-sm">Không có vai trò</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          {displayProfile?.permissions && displayProfile.permissions.length > 0 && (
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>Quyền hạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(displayProfile.permissions) ? (
                    displayProfile.permissions.map((permission: string) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">Không có quyền hạn</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
