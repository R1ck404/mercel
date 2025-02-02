import * as React from "react";
import Link from "next/link"; // Import Link from next/link
import { Button, ButtonProps } from "./button";
import { MenuContainer, Menu, MenuItem, MenuButton } from "./menu";
import { ChevronDown } from "lucide-react"; // Assuming you have an icon library like lucide-react

export interface SplitButtonProps extends ButtonProps {
    menuItems: Array<{
        label: string;
        onClick: () => void;
    }>;
    href?: string; // Add a link prop
}

const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
    ({ children, menuItems, href, ...props }, ref) => {
        // Wrap the primary button in a Link if the link prop exists
        const PrimaryButton = href ? (
            <Link href={href} passHref legacyBehavior>
                <Button {...props} ref={ref} className="rounded-r-none">
                    {children}
                </Button>
            </Link>
        ) : (
            <Button {...props} ref={ref} className="rounded-r-none">
                {children}
            </Button>
        );

        return (
            <div className="flex">
                {PrimaryButton}

                <hr className="h-full w-px bg-gray-alpha-400" />

                <MenuContainer>
                    <MenuButton
                        variant={props.variant}
                        size={props.size}
                        className="rounded-l-none"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </MenuButton>
                    <Menu>
                        {menuItems.map((item, index) => (
                            <MenuItem key={index} onClick={item.onClick}>
                                {item.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </MenuContainer>
            </div>
        );
    }
);

SplitButton.displayName = "SplitButton";

export { SplitButton };