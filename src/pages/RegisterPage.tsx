import React, { useState } from 'react';

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
            toast({
                title: "Đăng ký thành công",
                description: "Vui lòng đăng nhập để tiếp tục.",
                variant: "success",
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: "Đăng ký thất bại",
                description: "Email hoặc Username có thể đã tồn tại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản</CardTitle>
                    <CardDescription className="text-slate-500">
                        Nhập thông tin của bạn để bắt đầu sử dụng hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Tên người dùng</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe123"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4 decoration-2">
                        Đăng nhập
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
