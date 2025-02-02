import { Star } from "lucide-react";
import { useState } from "react";

const StarHoverAnimation = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <span
            className="flex items-center justify-between w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span>Add Favorite</span>

            <div>
                <Star
                    size={18}
                    className="text-yellow-400 transition-transform duration-300 hover:scale-110"
                />

                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className={`absolute top-4 right-4 transition-all duration-500 ease-in-out rotate-12 ${isHovered ? "opacity-100" : "opacity-0"
                            }`}
                        style={{
                            transform: `translate(${isHovered ? Math.cos((index * 72 * Math.PI) / 180) * 14 : 0
                                }px, ${isHovered ? Math.sin((index * 72 * Math.PI) / 180) * 14 : 0
                                }px) scale(${isHovered ? 1 : 0})`,
                        }}
                    >
                        <Star
                            size={6}
                            className="text-yellow-400 fill-yellow-400"
                        />
                    </div>
                ))}
            </div>
        </span>
    );
};

export default StarHoverAnimation;