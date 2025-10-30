
import { MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
    return (
        <main className="flex h-screen w-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 bg-primary text-primary-foreground p-3 rounded-full">
                        <MessageSquareText className="h-8 w-8" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </main>
    );
}
