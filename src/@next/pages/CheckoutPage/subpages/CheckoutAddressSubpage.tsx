import React, {
  forwardRef,
  RefForwardingComponent,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { CheckoutAddress } from "@components/organisms";
import { useCheckout, useUserDetails } from "@sdk/react";
import { ShopContext } from "@temp/components/ShopProvider/context";
import { CHECKOUT_STEPS } from "@temp/core/config";
import { IAddress, IFormError } from "@types";

export interface ICheckoutAddressSubpageHandles {
  submitAddress: () => void;
}

const CheckoutAddressSubpageWithRef: RefForwardingComponent<
  ICheckoutAddressSubpageHandles,
  RouteComponentProps<any>
> = ({ ...props }: RouteComponentProps<any>, ref) => {
  const checkoutAddressFormId = "address-form";
  const checkoutAddressFormRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    submitAddress: () => {
      if (user && selectedShippingAddressId) {
        checkoutAddressFormRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true })
        );
      } else {
        // TODO validate form
        checkoutAddressFormRef.current?.dispatchEvent(
          new Event("submit", { cancelable: true })
        );
      }
    },
  }));

  const history = useHistory();
  const { data: user } = useUserDetails();
  const {
    checkout,
    setShippingAddress,
    selectedShippingAddressId,
  } = useCheckout();
  const { countries } = useContext(ShopContext);

  const [errors, setErrors] = useState<IFormError[]>([]);

  const checkoutShippingAddress = checkout?.shippingAddress
    ? {
        ...checkout?.shippingAddress,
        phone: checkout?.shippingAddress?.phone || undefined,
      }
    : undefined;

  const handleSetShippingAddress = async (
    address: IAddress,
    email?: string,
    userAddressId?: string
  ) => {
    let shippingEmail;
    if (user && userAddressId) {
      shippingEmail = user?.email;
    } else if (email) {
      shippingEmail = email;
    } else {
      return;
    }

    const { dataError } = await setShippingAddress(
      {
        ...address,
        id: userAddressId,
      },
      shippingEmail
    );
    const errors = dataError?.error.extraInfo.userInputErrors;
    if (errors) {
      setErrors(errors);
    } else {
      setErrors([]);
      history.push(CHECKOUT_STEPS[0].nextStepLink);
    }
  };

  const userAdresses =
    user?.addresses
      ?.filter(function notEmpty<TValue>(
        value: TValue | null | undefined
      ): value is TValue {
        return value !== null && value !== undefined;
      })
      .map(address => ({
        address: {
          ...address,
          isDefaultBillingAddress: address.isDefaultBillingAddress || false,
          isDefaultShippingAddress: address.isDefaultShippingAddress || false,
          phone: address.phone || undefined,
        },
        id: address?.id || "",
        onSelect: () => null,
      })) || [];

  return (
    <CheckoutAddress
      {...props}
      errors={errors}
      formId={checkoutAddressFormId}
      formRef={checkoutAddressFormRef}
      checkoutAddress={checkoutShippingAddress}
      email={checkout?.email}
      userAddresses={userAdresses}
      selectedUserAddressId={selectedShippingAddressId}
      countries={countries}
      setShippingAddress={handleSetShippingAddress}
    />
  );
};

const CheckoutAddressSubpage = forwardRef(CheckoutAddressSubpageWithRef);

export { CheckoutAddressSubpage };