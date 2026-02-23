import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Đăng ký với dữ liệu:', formData);
            const response = await authService.register(formData);
            console.log('Đăng ký thành công:', response.data);

            toast({
                title: "Đăng ký thành công! 🎉",
                description: "Vui lòng đăng nhập để tiếp tục.",
                variant: "success",
            });

            // Đợi 1.5 giây để người dùng nhìn thấy thông báo
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error: any) {
            console.error('Lỗi đăng ký:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Không thể kết nối tới server. Vui lòng thử lại.";
            toast({
                title: "Đăng ký thất bại ❌",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <Card className="w-full max-w-md shadow-2xl border-slate-200/60 backdrop-blur-sm bg-white/90 animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-3 text-center pt-8 pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Tạo tài khoản
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Nhập thông tin để bắt đầu sử dụng hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid gap-2.5">
                            <Label htmlFor="username" className="text-slate-700 font-semibold">Tên người dùng</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="johndoe123"
                                    className="pl-11 h-11 bg-slate-50/80 border-slate-200 focus:bg-white transition-colors"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@mail.com"
                                    className="pl-11 h-11 bg-slate-50/80 border-slate-200 focus:bg-white transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2.5">
                            <Label htmlFor="password" className="text-slate-700 font-semibold">Mật khẩu</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-11 h-11 bg-slate-50/80 border-slate-200 focus:bg-white transition-colors"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                "Đăng ký"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-slate-600 pb-8">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline underline-offset-4 decoration-2 transition-colors">
                        Đăng nhập
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
