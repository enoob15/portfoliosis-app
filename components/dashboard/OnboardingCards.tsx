
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Linkedin, Link as LinkIcon, Edit } from 'lucide-react';

interface OnboardingCardsProps {
    onSelect: (option: 'resume' | 'linkedin' | 'manual' | 'links') => void;
}

export function OnboardingCards({ onSelect }: OnboardingCardsProps) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">How would you like to build your portfolio?</h2>
                <p className="text-gray-500">Choose the best starting point for you. You can always add more details later.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Option: Resume */}
                <Card
                    className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5 cursor-pointer hover:border-primary transition-all group"
                    onClick={() => onSelect('resume')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Upload your Resume</CardTitle>
                                <CardDescription>
                                    The fastest way. We'll extract your experience, education, and skills automatically.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Secondary Option: LinkedIn */}
                <Card
                    className="cursor-pointer hover:border-blue-400 transition-all group"
                    onClick={() => onSelect('linkedin')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                <Linkedin className="h-5 w-5 text-[#0077b5]" />
                            </div>
                            <CardTitle className="text-lg">Import from LinkedIn</CardTitle>
                        </div>
                        <CardDescription>
                            Connect your profile to import your professional history and recommendations.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Secondary Option: Manual / Scratch */}
                <Card
                    className="cursor-pointer hover:border-gray-400 transition-all group"
                    onClick={() => onSelect('manual')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                                <Edit className="h-5 w-5 text-gray-700" />
                            </div>
                            <CardTitle className="text-lg">Start from Scratch</CardTitle>
                        </div>
                        <CardDescription>
                            Use our manual editor to build your portfolio piece by piece.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <div className="text-center">
                <Button variant="link" onClick={() => onSelect('links')} className="text-gray-500 hover:text-gray-900">
                    Just want to promote some links?
                </Button>
            </div>
        </div>
    );
}
