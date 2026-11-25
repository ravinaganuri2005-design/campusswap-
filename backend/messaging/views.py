from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Enquiry, Message, EnquiryStatus
from marketplace.models import Product
from .serializers import (
    EnquiryListSerializer,
    EnquiryDetailSerializer,
    CreateEnquirySerializer,
    CreateReplySerializer,
    MessageSerializer
)

class EnquiryListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        query_type = request.query_params.get('type')  # 'sent', 'received', or all

        if query_type == 'sent':
            enquiries = Enquiry.objects.filter(buyer=user)
        elif query_type == 'received':
            enquiries = Enquiry.objects.filter(seller=user)
        else:
            enquiries = Enquiry.objects.filter(Q(buyer=user) | Q(seller=user))

        enquiries = enquiries.select_related('product', 'buyer', 'seller', 'buyer__profile', 'seller__profile').prefetch_related('messages')
        serializer = EnquiryListSerializer(enquiries, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        # Determine if this is creating a new enquiry or replying
        if 'product_id' in request.data:
            serializer = CreateEnquirySerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                data = serializer.validated_data
                product = Product.objects.get(id=data['product_id'])
                
                enquiry = Enquiry.objects.create(
                    product=product,
                    buyer=request.user,
                    seller=product.seller,
                    subject=data.get('subject') or f"Enquiry regarding '{product.title}'"
                )
                
                Message.objects.create(
                    enquiry=enquiry,
                    sender=request.user,
                    body=data['message']
                )

                detail_serializer = EnquiryDetailSerializer(enquiry, context={'request': request})
                return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif 'enquiry_id' in request.data:
            serializer = CreateReplySerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                data = serializer.validated_data
                enquiry = Enquiry.objects.get(id=data['enquiry_id'])

                message = Message.objects.create(
                    enquiry=enquiry,
                    sender=request.user,
                    body=data['body']
                )

                # Update enquiry status if seller replied
                if request.user == enquiry.seller and enquiry.status == EnquiryStatus.PENDING:
                    enquiry.status = EnquiryStatus.RESPONDED
                enquiry.save()

                return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"error": "Please provide either 'product_id' to start an enquiry or 'enquiry_id' to send a reply."},
            status=status.HTTP_400_BAD_REQUEST
        )

class EnquiryDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            enquiry = Enquiry.objects.select_related(
                'product', 'buyer', 'seller', 'buyer__profile', 'seller__profile'
            ).prefetch_related('messages', 'messages__sender').get(pk=pk)
        except Enquiry.DoesNotExist:
            return Response({"error": "Enquiry not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != enquiry.buyer and request.user != enquiry.seller:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        # Mark unread incoming messages as read
        enquiry.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        serializer = EnquiryDetailSerializer(enquiry, context={'request': request})
        return Response(serializer.data)
